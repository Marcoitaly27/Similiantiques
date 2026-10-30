"""Prepare exactly five Python references, then check the browser report.

python scripts/consistency.py prepare photo1.jpg ... photo5.jpg
Visit /consistency.html on the local server; run and save its report.
python scripts/consistency.py verify browser-consistency.json
Both the browser and this verifier require every cosine > 0.98.
"""
import argparse
import json
import math
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    prepare_parser = commands.add_parser("prepare")
    prepare_parser.add_argument("images", type=Path, nargs=5)
    prepare_parser.add_argument("--output", type=Path, default=Path("public/data/consistency"))
    verify_parser = commands.add_parser("verify")
    verify_parser.add_argument("report", type=Path)
    args = parser.parse_args()
    if args.command == "verify":
        report = json.loads(args.report.read_text())
        rows = report.get("samples", [])
        passed = len(rows) == 5 and all(isinstance(row.get("cosine"), (int, float)) and
                   math.isfinite(row["cosine"]) and 0.98 < row["cosine"] <= 1.000001 for row in rows)
        if not passed:
            raise SystemExit("FAIL: five finite cosines strictly above 0.98 are required")
        print("PASS: 5/5 Python/browser image embedding cosines > 0.98")
        return
    # Verification alone deliberately needs only Python's standard library.
    from clip_pipeline import ClipPipeline, prepare, MODEL, REVISION
    pipeline = ClipPipeline()
    args.output.mkdir(parents=True, exist_ok=True)
    samples = []
    for index, path in enumerate(args.images):
        image = prepare(path)
        name = f"sample-{index + 1}.png"
        image.save(args.output / name)
        samples.append({"image": name, "python": pipeline.embed(image).tolist()})
    document = {"model": MODEL, "revision": REVISION, "samples": samples}
    (args.output / "references.json").write_text(json.dumps(document))
    print("Prepared five lossless, oriented, white-background references. Open /consistency.html.")


if __name__ == "__main__":
    main()
