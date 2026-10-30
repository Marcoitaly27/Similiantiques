"""Build objects.json + little-endian float16 vectors from CC0 Met records.

Usage: python scripts/build_catalogue.py catalogue-manifest.json
Manifest: array of {"image": "relative/local.jpg", "object": {Met API record}}.
Only local images are read. Fetch metadata/images separately under The Met policy.
"""
import argparse
import json
from pathlib import Path
import numpy as np
from clip_pipeline import ClipPipeline, prepare

FIELDS = ["objectID", "title", "department", "period", "culture", "objectDate",
          "creditLine", "objectURL", "primaryImageSmall"]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--output", type=Path, default=Path("public/data"))
    args = parser.parse_args()
    records = json.loads(args.manifest.read_text())
    if not isinstance(records, list) or not records:
        parser.error("Manifest must be a nonempty array")
    pipeline = ClipPipeline()
    objects, vectors, seen = [], [], set()
    for item in records:
        obj = item["object"]
        if obj.get("isPublicDomain") is not True:
            raise ValueError("Only Met Open Access public-domain objects are supported")
        if not isinstance(obj.get("objectID"), int) or obj["objectID"] in seen:
            raise ValueError("Missing or duplicate objectID")
        seen.add(obj["objectID"])
        metadata = {key: obj.get(key, "") for key in FIELDS}
        if any(not isinstance(metadata[key], str) for key in FIELDS if key != "objectID"):
            raise ValueError("Metadata fields must be strings")
        image = prepare(args.manifest.parent / item["image"])
        vectors.append(pipeline.embed(image))
        objects.append(metadata)
    args.output.mkdir(parents=True, exist_ok=True)
    binary = np.asarray(vectors, dtype="<f2").tobytes(order="C")
    # Write both temp files first; publish the pair together during deployment.
    (args.output / "embeddings.bin.tmp").write_bytes(binary)
    (args.output / "objects.json.tmp").write_text(json.dumps(objects, ensure_ascii=False))
    (args.output / "embeddings.bin.tmp").replace(args.output / "embeddings.bin")
    (args.output / "objects.json.tmp").replace(args.output / "objects.json")
    print(f"Wrote {len(objects)} normalized 512-D rows ({len(binary)} bytes)")


if __name__ == "__main__":
    main()
