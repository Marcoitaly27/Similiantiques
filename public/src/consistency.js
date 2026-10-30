import { embedPhoto } from './model.js';
import { preparePhoto } from './photo.js';
import { normalize, dot } from './search.js';
import { MODEL, TRANSFORMERS_URL } from './config.js';
const button = document.querySelector('#run');
const output = document.querySelector('#report');
const save = document.querySelector('#save');
let reportURL;
button.onclick = async () => {
  button.disabled = true; save.hidden = true;
  output.textContent = 'Loading Python references…';
  document.querySelector('#check-progress').value = 0;
  try {
    const response = await fetch('./data/consistency/references.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Run scripts/consistency.py prepare with five sample images first.');
    const references = await response.json();
    if (references.samples?.length !== 5) throw new Error('Exactly five reference images are required.');
    const samples = [];
    for (const [index, sample] of references.samples.entries()) {
      output.textContent = `Embedding image ${index + 1}/5. The first model download may take several minutes…`;
      const image = await fetch(new URL(`../data/consistency/${sample.image}`, import.meta.url));
      if (!image.ok) throw new Error(`Missing sample: ${sample.image}`);
      const photo = await preparePhoto(new File([await image.blob()], sample.image, { type: 'image/png' }));
      const result = await embedPhoto(photo.pixels, photo.width, photo.height);
      const cosine = dot(normalize(result.image), normalize(sample.python));
      samples.push({ image: sample.image, cosine, passed: cosine > 0.98 });
      document.querySelector('#check-progress').value = index + 1;
    }
    const report = { timestamp: new Date().toISOString(), browserModel: MODEL, transformers: TRANSFORMERS_URL,
      pythonModel: references.model, pythonRevision: references.revision, quantized: false,
      passed: samples.every(sample => sample.passed), samples };
    output.textContent = JSON.stringify(report, null, 2);
    if (reportURL) URL.revokeObjectURL(reportURL);
    reportURL = URL.createObjectURL(new Blob([output.textContent], { type: 'application/json' }));
    save.href = reportURL; save.hidden = false;
  } catch (error) { output.textContent = `NOT VERIFIED: ${error.message}`; }
  finally { button.disabled = false; }
};
