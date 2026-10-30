import test from 'node:test';
import assert from 'node:assert/strict';
import { float16ToFloat32, parseEmbeddings, normalize, dot, blend, rank } from '../public/src/search.js';

const objects = [
  { title: 'Vase', department: 'Greek', period: 'Classical', culture: 'Greek' },
  { title: 'Bowl', department: 'Asian', period: 'Ming', culture: 'Chinese' },
  { title: 'Cup', department: 'Greek', period: 'Classical', culture: 'Roman' },
  { title: 'Plate', department: 'Greek', period: 'Archaic', culture: 'Greek' },
];
const vectors = Float32Array.from([0, 1, 1, 0, 0.6, 0.8, -1, 0]);
function binary(words) {
  const buffer = new ArrayBuffer(words.length * 2);
  words.forEach((word, index) => new DataView(buffer).setUint16(index * 2, word, true));
  return buffer;
}

test('ranking uses descending cosine similarity, including negative scores', () => {
  const results = rank([1, 0], vectors, objects);
  assert.deepEqual(results.map(result => result.object.title), ['Bowl', 'Cup', 'Vase', 'Plate']);
  assert.equal(results[0].score, 1);
  assert.equal(results[3].score, -1);
});
test('top-k limits the ranked output and handles zero or oversize k', () => {
  assert.deepEqual(rank([1, 0], vectors, objects, { topK: 2 }).map(r => r.index), [1, 2]);
  assert.equal(rank([1, 0], vectors, objects, { topK: 0 }).length, 0);
  assert.equal(rank([1, 0], vectors, objects, { topK: 99 }).length, 4);
  assert.throws(() => rank([1, 0], vectors, objects, { topK: -1 }));
});
test('default top-k is 12', () => {
  const many = Array.from({ length: 20 }, () => objects[0]);
  const rows = Float32Array.from(many.flatMap(() => [1, 0]));
  assert.equal(rank([1, 0], rows, many).length, 12);
});
test('filters combine department, period and culture before top-k', () => {
  const filters = { department: 'Greek', period: 'Classical', culture: 'Greek' };
  assert.deepEqual(rank([1, 0], vectors, objects, { topK: 1, filters }).map(r => r.index), [0]);
  assert.deepEqual(rank([1, 0], vectors, objects, { filters: { culture: 'Absent' } }), []);
  assert.equal(rank([1, 0], vectors, objects, { filters: { period: '' } }).length, 4);
});
test('ties preserve metadata order, inputs remain unchanged', () => {
  const tied = new Float32Array([1, 0, 1, 0]);
  assert.deepEqual(rank([2, 0], tied, objects.slice(0, 2)).map(r => r.index), [0, 1]);
  assert.deepEqual([...tied], [1, 0, 1, 0]);
});
test('float16 decodes signed zeros, normals, subnormals and special values', () => {
  assert.equal(float16ToFloat32(0x3c00), 1);
  assert.equal(float16ToFloat32(0xc000), -2);
  assert.equal(float16ToFloat32(0x0001), 2 ** -24);
  assert.equal(float16ToFloat32(0x03ff), 1023 * 2 ** -24);
  assert.equal(float16ToFloat32(0x0400), 2 ** -14);
  assert.equal(float16ToFloat32(0x7bff), 65504);
  assert.ok(Object.is(float16ToFloat32(0x8000), -0));
  assert.equal(float16ToFloat32(0x7c00), Infinity);
  assert.equal(float16ToFloat32(0xfc00), -Infinity);
  assert.ok(Number.isNaN(float16ToFloat32(0x7e00)));
});
test('binary parsing reads little-endian float16 rows in metadata order', () => {
  const output = parseEmbeddings(binary([0x3c00, 0, 0, 0xbc00]), 2, 2);
  assert.ok(output instanceof Float32Array);
  assert.deepEqual([...output], [1, 0, 0, -1]);
  assert.equal(rank([0, 1], output, objects.slice(0, 2))[0].index, 0);
});
test('binary parsing removes float16 rounding drift', () => {
  const output = parseEmbeddings(binary([0x38cd, 0x3a66]), 1, 2); // ~0.6, ~0.8
  assert.ok(Math.abs(dot(output, output) - 1) < 1e-6);
});
test('rejects truncated, extra, non-finite, zero and unnormalized rows', () => {
  for (const buffer of [new ArrayBuffer(3), new ArrayBuffer(6), binary([0x7c00, 0]),
    binary([0x7e00, 0]), binary([0, 0]), binary([0x4000, 0])]) {
    assert.throws(() => parseEmbeddings(buffer, 1, 2));
  }
  assert.throws(() => parseEmbeddings(new ArrayBuffer(0), 0));
});
test('blend normalizes each encoder and the weighted result', () => {
  assert.deepEqual([...blend([2, 0], null, 0.5)], [1, 0]);
  const mixed = blend([2, 0], [0, 3], 0.5);
  assert.ok(Math.abs(mixed[0] - Math.SQRT1_2) < 1e-6);
  assert.ok(Math.abs(dot(mixed, mixed) - 1) < 1e-6);
  assert.deepEqual([...blend([1, 0], [0, 1], 1)], [0, 1]);
  assert.throws(() => blend([1, 0], [0, 1], 1.1));
});
test('rejects invalid query dimensions and undefined cosine', () => {
  assert.throws(() => rank([1, 0, 0], vectors, objects));
  assert.throws(() => normalize([0, 0]));
  assert.throws(() => normalize([NaN, 1]));
  assert.throws(() => dot([1], [1, 2]));
  assert.throws(() => blend([1], [1, 2], 0.5));
});
