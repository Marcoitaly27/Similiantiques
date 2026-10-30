import { t } from './i18n.js';
import { element } from './render.js';
// Replace each null with a local JPEG/PNG/WebP path, e.g. './examples/vessel.jpg'.
export const examples = [
  { key: 'vessel', photo: null }, { key: 'ornament', photo: null },
  { key: 'sculpture', photo: null }, { key: 'textile', photo: null },
  { key: 'tableware', photo: null }, { key: 'detail', photo: null },
];
export function renderExamples(onSelect) {
  const grid = document.querySelector('#example-grid');
  grid.replaceChildren();
  for (const [index, sample] of examples.entries()) {
    const button = element('button', 'example');
    button.type = 'button'; button.disabled = !sample.photo;
    button.setAttribute('aria-label', `${t(sample.key)}${sample.photo ? '' : ` · ${t('samplePlaceholder')}`}`);
    const img = element('img');
    img.src = sample.photo || `./examples/placeholder-${index + 1}.svg`;
    img.alt = ''; img.loading = 'lazy';
    button.append(img, element('span', '', `${String(index + 1).padStart(2, '0')} / ${t(sample.key)}`));
    if (sample.photo) button.addEventListener('click', () => onSelect(sample.photo));
    grid.append(button);
  }
  document.querySelector('[data-i18n="exampleNote"]').hidden = examples.some(example => example.photo);
}
