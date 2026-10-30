import { parseEmbeddings } from './search.js';
let pending;
export function loadCollection() {
  if (!pending) pending = load().catch(error => { pending = null; throw error; });
  return pending;
}
async function load() {
  const [metadata, binary] = await Promise.all([
    fetch(new URL('../data/objects.json', import.meta.url)),
    fetch(new URL('../data/embeddings.bin', import.meta.url)),
  ]);
  if (!metadata.ok || !binary.ok) throw new Error('Collection files missing');
  const objects = await metadata.json();
  if (!Array.isArray(objects) || !objects.length || objects.some(object =>
    !object || typeof object !== 'object' || !Number.isInteger(object.objectID) ||
    ['title', 'department', 'period', 'culture', 'objectDate', 'creditLine', 'objectURL', 'primaryImageSmall']
      .some(key => typeof object[key] !== 'string'))) throw new Error('Invalid objects.json');
  const vectors = parseEmbeddings(await binary.arrayBuffer(), objects.length);
  return { objects, vectors };
}
