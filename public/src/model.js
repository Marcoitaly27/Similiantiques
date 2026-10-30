let worker;
let sequence = 0;
const requests = new Map();
export function embedPhoto(pixels, width, height, text = '', onProgress = () => {}) {
  if (!worker) {
    worker = new Worker(new URL('./model-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (data.type === 'progress') {
        for (const request of requests.values()) request.onProgress(data.event);
      } else if (data.type === 'ready') {
        requests.get(data.id)?.onProgress({ status: 'ready' });
      } else if (data.type === 'result' || data.type === 'error') {
        const request = requests.get(data.id);
        if (!request) return;
        clearTimeout(request.timer);
        requests.delete(data.id);
        if (data.type === 'result') request.resolve(data);
        else request.reject(new Error(data.message));
      }
    };
    worker.onerror = () => reset(new Error('Model worker failed'));
  }
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reset(new Error('Model download or inference timed out')), 600_000);
    requests.set(id, { resolve, reject, onProgress, timer });
    worker.postMessage({ id, pixels: pixels.buffer, width, height, text }, [pixels.buffer]);
  });
}
function reset(error) {
  worker?.terminate();
  worker = null;
  for (const request of requests.values()) {
    clearTimeout(request.timer);
    request.reject(error);
  }
  requests.clear();
}
