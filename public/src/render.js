import { t, getLanguage } from './i18n.js';
export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
export function safeURL(value, kind = 'page') {
  try {
    const url = new URL(value);
    const hosts = kind === 'image' ? ['images.metmuseum.org', 'www.metmuseum.org', 'collectionapi.metmuseum.org']
      : ['www.metmuseum.org', 'metmuseum.org'];
    return url.protocol === 'https:' && hosts.includes(url.hostname) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
export function museumImage(url, title, className = '') {
  const img = element('img', className);
  img.alt = title;
  img.loading = 'lazy';
  img.referrerPolicy = 'no-referrer';
  const source = safeURL(url, 'image');
  if (source) img.src = source;
  else img.alt = t('noImage');
  img.addEventListener('error', () => { img.removeAttribute('src'); img.alt = t('noImage'); }, { once: true });
  return img;
}
export function renderCards(results, preview) {
  const container = document.querySelector('#results');
  container.replaceChildren();
  for (const { object, score } of results) {
    const card = element('article', 'card');
    const title = object.title || t('untitled');
    const body = element('div', 'card-body');
    const percent = new Intl.NumberFormat(getLanguage(), { style: 'percent', maximumFractionDigits: 1 }).format(score);
    body.append(element('span', 'score', `${percent} ${t('similarity')}`), element('h3', '', title));
    body.append(element('p', '', [object.culture, object.period, object.objectDate].filter(Boolean).join(' · ')));
    body.append(element('p', '', object.department));
    const url = safeURL(object.objectURL);
    if (url) {
      const link = element('a', '', t('museum'));
      link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      body.append(link);
    }
    const compare = element('button', 'button secondary', t('why'));
    compare.type = 'button';
    compare.setAttribute('aria-label', `${t('why')}: ${title}`);
    compare.addEventListener('click', () => showCompare(object, preview, compare));
    body.append(compare, element('p', 'credit', object.creditLine));
    card.append(museumImage(object.primaryImageSmall, title, 'card-image'), body);
    container.append(card);
  }
}
let returnFocus;
let selectedObject;
export function showCompare(object, preview, trigger) {
  selectedObject = object; returnFocus = trigger;
  const user = document.querySelector('#compare-user');
  user.src = preview; user.alt = t('yourPhoto');
  const match = document.querySelector('#compare-match');
  const replacement = museumImage(object.primaryImageSmall, object.title);
  replacement.id = match.id;
  match.replaceWith(replacement);
  document.querySelector('#compare-name').textContent = object.title;
  document.querySelector('#compare').showModal();
  document.querySelector('#close-compare').focus();
}
export function refreshCompareLanguage() {
  document.querySelector('#compare-user').alt = t('yourPhoto');
  if (selectedObject) document.querySelector('#compare-name').textContent = selectedObject.title;
}
export function setupCompare() {
  const dialog = document.querySelector('#compare');
  document.querySelector('#close-compare').onclick = () => dialog.close();
  dialog.addEventListener('close', () => returnFocus?.focus());
}
export function renderFilters(objects) {
  for (const key of ['department', 'period', 'culture']) {
    const select = document.querySelector(`#${key}`);
    const current = select.value;
    select.replaceChildren(new Option(t('all'), ''));
    const values = [...new Set(objects.map(object => object[key]).filter(Boolean))].sort();
    for (const value of values) select.add(new Option(value, value));
    select.value = current;
  }
}
