import { t, applyLanguage, toggleLanguage } from './i18n.js';
import { preparePhoto, PhotoError } from './photo.js';
import { embedPhoto } from './model.js';
import { blend, rank } from './search.js';
import { loadCollection } from './data.js';
import { renderCards, renderFilters, setupCompare, refreshCompareLanguage } from './render.js';
import { renderExamples } from './examples.js';

const $ = selector => document.querySelector(selector);
let photo, collection, query, busy = false, selection = 0;
let statusKey = '', errorKey = '';
const downloads = new Map();
function status(key = '') { statusKey = key; $('#status').textContent = key ? t(key) : ''; }
function error(key = '') {
  errorKey = key; $('#error').hidden = !key; $('#error').textContent = key ? t(key) : '';
}
function setBusy(value) {
  busy = value;
  for (const selector of ['#choose', '#camera', '#file', '#camera-file', '#description', '#weight']) $(selector).disabled = value;
  $('#search').disabled = value || !photo;
  $('#search-form').setAttribute('aria-busy', String(value));
  $('#results').setAttribute('aria-busy', String(value));
  $('#download').hidden = !value;
}
function draw() {
  if (!query || !collection) {
    $('#results').replaceChildren(); $('#empty').hidden = false;
    $('#empty').textContent = t('empty'); $('#result-count').textContent = '';
    return;
  }
  const filters = Object.fromEntries(['department', 'period', 'culture'].map(key => [key, $(`#${key}`).value]));
  const matches = rank(query, collection.vectors, collection.objects, { filters });
  renderCards(matches, photo.preview);
  $('#result-count').textContent = `${matches.length} ${t('results')}`;
  $('#empty').hidden = matches.length > 0;
  $('#empty').textContent = t('noMatches');
}
async function selectPhoto(file) {
  if (!file || busy) return;
  const current = ++selection;
  error();
  try {
    const next = await preparePhoto(file);
    if (current !== selection) return;
    photo = next; query = null;
    $('#preview').src = photo.preview; $('#preview').alt = t('yourPhoto');
    $('#preview').hidden = false; $('#upload-prompt').hidden = true;
    $('#search').disabled = false;
    draw(); status('selected');
  } catch (cause) {
    if (current === selection) error(cause instanceof PhotoError ? cause.message : 'decodeError');
  }
}
function progress(event) {
  const file = `${event.name || ''}/${event.file || ''}`;
  if (event.status === 'progress' && event.total > 0) downloads.set(file, { loaded: event.loaded, total: event.total });
  if (event.status === 'done' && downloads.has(file)) downloads.get(file).loaded = downloads.get(file).total;
  let loaded = 0, total = 0;
  for (const entry of downloads.values()) { loaded += entry.loaded; total += entry.total; }
  if (total) {
    $('#model-progress').value = Math.min(100, loaded / total * 100);
    $('#download-detail').textContent = `${(loaded / 1e6).toFixed(1)} / ${(total / 1e6).toFixed(1)} MB`;
  }
  if (event.status === 'ready') status('cached');
}
async function search(event) {
  event.preventDefault();
  if (!photo || busy) return;
  error(); status('loadingData'); setBusy(true);
  downloads.clear(); $('#model-progress').removeAttribute('value'); $('#download-detail').textContent = '';
  try {
    try {
      collection = await loadCollection(); renderFilters(collection.objects);
    } catch { error(navigator.onLine ? 'dataError' : 'offline'); return; }
    status('working');
    let result;
    try {
      // Transfer a copy so subsequent refinements can reuse the resized photo.
      result = await embedPhoto(photo.pixels.slice(), photo.width, photo.height, $('#description').value, progress);
      query = blend(result.image, result.text, Number($('#weight').value) / 100);
    } catch { error(navigator.onLine ? 'modelError' : 'offline'); return; }
    draw(); status();
    $('#results-heading').tabIndex = -1; $('#results-heading').focus({ preventScroll: true });
    $('#results-section').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  } finally { setBusy(false); if (errorKey) status(); }
}
async function samplePhoto(path) {
  if (busy) return;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Example missing');
    const blob = await response.blob();
    await selectPhoto(new File([blob], path.split('/').pop(), { type: blob.type }));
  } catch { error('sampleError'); }
}
$('#choose').onclick = () => $('#file').click();
$('#camera').onclick = () => $('#camera-file').click();
for (const selector of ['#file', '#camera-file']) {
  $(selector).onchange = event => { selectPhoto(event.target.files[0]); event.target.value = ''; };
}
for (const name of ['dragover', 'dragenter', 'dragleave', 'drop']) {
  $('#drop-zone').addEventListener(name, event => {
    event.preventDefault();
    $('#drop-zone').classList.toggle('dragover', !busy && ['dragover', 'dragenter'].includes(name));
    if (name === 'drop') selectPhoto(event.dataTransfer.files[0]);
  });
}
// A dropped file elsewhere must not navigate away from the app.
window.addEventListener('dragover', event => event.preventDefault());
window.addEventListener('drop', event => event.preventDefault());
$('#search-form').onsubmit = search;
$('#weight').oninput = event => { $('#weight-value').value = `${event.target.value}%`; };
for (const key of ['department', 'period', 'culture']) $(`#${key}`).onchange = draw;
$('#language').onclick = () => {
  toggleLanguage(); renderFilters(collection?.objects || []); renderExamples(samplePhoto);
  status(statusKey); error(errorKey); draw(); refreshCompareLanguage();
  if (photo) $('#preview').alt = t('yourPhoto');
};
window.addEventListener('offline', () => error('offline'));
setupCompare(); applyLanguage(); renderFilters([]); renderExamples(samplePhoto);
// Load metadata early so filters and missing-catalogue feedback are useful before inference.
loadCollection().then(value => { collection = value; renderFilters(value.objects); }).catch(() => error(navigator.onLine ? 'dataError' : 'offline'));
