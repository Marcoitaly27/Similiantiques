import { MAX_BYTES, MAX_PIXELS, MAX_EDGE } from './config.js';

export class PhotoError extends Error {}
export async function preparePhoto(file) {
  if (!file.size || file.size > MAX_BYTES) throw new PhotoError('sizeError');
  if (/\.(heic|heif)$/i.test(file.name || '') || /image\/hei[cf]/i.test(file.type)) {
    throw new PhotoError('heicError');
  }
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
    throw new PhotoError('formatError');
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    image.src = url;
    await image.decode(); // Browser applies EXIF orientation, including iPhone JPEGs.
    if (image.naturalWidth * image.naturalHeight > MAX_PIXELS) throw new PhotoError('pixelsError');
    const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return { pixels, width: canvas.width, height: canvas.height, preview: canvas.toDataURL('image/jpeg', 0.85) };
  } catch (error) {
    if (error instanceof PhotoError) throw error;
    throw new PhotoError('decodeError');
  } finally { URL.revokeObjectURL(url); }
}
