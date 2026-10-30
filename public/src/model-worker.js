import { TRANSFORMERS_URL, MODEL } from './config.js';

let models;
let library;
async function load() {
  if (!models) {
    models = (async () => {
      library = await import(`${TRANSFORMERS_URL}/dist/transformers.min.js`);
      library.env.allowLocalModels = false;
      library.env.useBrowserCache = true;
      library.env.backends.onnx.wasm.wasmPaths = `${TRANSFORMERS_URL}/dist/`;
      // GitHub Pages is not cross-origin isolated. A single WASM thread needs no COOP/COEP.
      library.env.backends.onnx.wasm.numThreads = 1;
      const progress_callback = event => postMessage({ type: 'progress', event });
      const options = { quantized: false, progress_callback };
      const [processor, vision, tokenizer, text] = await Promise.all([
        library.AutoProcessor.from_pretrained(MODEL, options),
        library.CLIPVisionModelWithProjection.from_pretrained(MODEL, options),
        library.AutoTokenizer.from_pretrained(MODEL, options),
        library.CLIPTextModelWithProjection.from_pretrained(MODEL, options),
      ]);
      return { processor, vision, tokenizer, text };
    })().catch(error => { models = null; throw error; });
  }
  return models;
}

self.onmessage = async ({ data }) => {
  try {
    const { processor, vision, tokenizer, text } = await load();
    postMessage({ type: 'ready', id: data.id });
    const image = new library.RawImage(new Uint8ClampedArray(data.pixels), data.width, data.height, 4).rgb();
    const imageInputs = await processor(image);
    const imageOutput = await vision(imageInputs);
    let textVector = null;
    if (data.text?.trim()) {
      const tokens = await tokenizer(data.text.trim(), { padding: true, truncation: true, max_length: 77 });
      textVector = Array.from((await text(tokens)).text_embeds.data);
    }
    postMessage({ type: 'result', id: data.id,
      image: Array.from(imageOutput.image_embeds.data), text: textVector });
  } catch (error) {
    postMessage({ type: 'error', id: data.id, message: String(error.message || error) });
  }
};
