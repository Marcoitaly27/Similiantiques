export const DIMENSIONS = 512;

export function float16ToFloat32(bits) {
  const sign = bits & 0x8000 ? -1 : 1;
  const exponent = (bits >>> 10) & 31;
  const fraction = bits & 1023;
  if (exponent === 31) return fraction ? NaN : sign * Infinity;
  if (exponent === 0) return sign * fraction * 2 ** -24;
  return sign * (1 + fraction / 1024) * 2 ** (exponent - 15);
}

export function normalize(vector) {
  const output = Float32Array.from(vector);
  let squared = 0;
  for (const value of output) {
    if (!Number.isFinite(value)) throw new Error('Non-finite vector');
    squared += value * value;
  }
  if (!squared) throw new Error('Zero vector');
  const norm = Math.sqrt(squared);
  return output.map(value => value / norm);
}

export function dot(a, b) {
  if (a.length !== b.length) throw new Error('Vector dimensions differ');
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

// Row-major, little-endian IEEE 754 binary16. Rows follow objects.json order.
export function parseEmbeddings(buffer, count, dimensions = DIMENSIONS) {
  if (!(buffer instanceof ArrayBuffer) || !Number.isInteger(count) || count < 1 ||
      !Number.isInteger(dimensions) || dimensions < 1 ||
      buffer.byteLength !== count * dimensions * 2) throw new Error('Invalid binary size');
  const view = new DataView(buffer);
  const vectors = new Float32Array(count * dimensions);
  for (let row = 0; row < count; row++) {
    let norm = 0;
    const offset = row * dimensions;
    for (let col = 0; col < dimensions; col++) {
      const value = float16ToFloat32(view.getUint16((offset + col) * 2, true));
      if (!Number.isFinite(value)) throw new Error('Non-finite embedding');
      vectors[offset + col] = value;
      norm += value * value;
    }
    if (Math.abs(Math.sqrt(norm) - 1) > 0.02) throw new Error('Embedding is not normalized');
    // Remove the small norm error introduced by float16 storage.
    for (let col = 0; col < dimensions; col++) vectors[offset + col] /= Math.sqrt(norm);
  }
  return vectors;
}

export function blend(image, text, weight = 0) {
  if (!Number.isFinite(weight) || weight < 0 || weight > 1) throw new Error('Invalid weight');
  const a = normalize(image);
  if (!text || !weight) return a;
  const b = normalize(text);
  if (a.length !== b.length) throw new Error('Vector dimensions differ');
  return normalize(a.map((value, i) => (1 - weight) * value + weight * b[i]));
}

export function rank(query, vectors, objects, { topK = 12, filters = {} } = {}) {
  if (!Number.isInteger(topK) || topK < 0) throw new Error('Invalid top-k');
  if (!query.length || vectors.length !== objects.length * query.length) {
    throw new Error('Dataset dimensions differ');
  }
  const unit = normalize(query);
  const results = [];
  for (let index = 0; index < objects.length; index++) {
    const object = objects[index];
    if (['department', 'period', 'culture'].some(key => filters[key] && object[key] !== filters[key])) continue;
    const score = dot(unit, vectors.subarray(index * unit.length, (index + 1) * unit.length));
    results.push({ object, index, score: Math.max(-1, Math.min(1, score)) });
  }
  return results.sort((a, b) => b.score - a.score || a.index - b.index).slice(0, topK);
}
