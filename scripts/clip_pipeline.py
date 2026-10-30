"""Shared Python CLIP recipe for catalogue generation and cross-runtime checks."""
from pathlib import Path
import numpy as np
import torch
from PIL import Image, ImageOps
from transformers import CLIPModel, CLIPProcessor

MODEL = "openai/clip-vit-base-patch32"
# Same original OpenAI weights exported by Xenova, using full-precision ONNX in JS.
REVISION = "3d74acf9a28c67741b2f4f2ea7635f0aaf6f0268"


def prepare(path):
    with Image.open(path) as source:
        if source.width * source.height > 60_000_000:
            raise ValueError(f"Image exceeds 60 megapixels: {Path(path).name}")
        image = ImageOps.exif_transpose(source).convert("RGBA")
        white = Image.new("RGBA", image.size, "white")
        white.alpha_composite(image)
        image = white.convert("RGB")
        if max(image.size) > 2048:
            ratio = 2048 / max(image.size)
            image = image.resize(tuple(max(1, round(side * ratio)) for side in image.size),
                                 Image.Resampling.LANCZOS)
        return image


class ClipPipeline:
    def __init__(self):
        self.processor = CLIPProcessor.from_pretrained(MODEL, revision=REVISION)
        self.model = CLIPModel.from_pretrained(MODEL, revision=REVISION).eval()
        torch.set_num_threads(min(4, torch.get_num_threads()))

    @torch.inference_mode()
    def embed(self, image):
        inputs = self.processor(images=image, return_tensors="pt")
        vector = self.model.get_image_features(**inputs)[0].float().cpu().numpy()
        if vector.shape != (512,) or not np.isfinite(vector).all():
            raise ValueError("Invalid CLIP image embedding")
        return vector / np.linalg.norm(vector)
