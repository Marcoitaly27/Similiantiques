# Index contract and compatibility

## Files

Publish a matching pair under `public/data/`:

* `objects.json`: nonempty array, one record per embedding row.
* `embeddings.bin`: no header; row-major little-endian IEEE float16;
  exactly `N * 512 * 2` bytes. Source embeddings are L2 normalized.

Record schema (example values demonstrate types, not a real museum record):

```json
{
  "objectID": 123,
  "title": "Museum title",
  "department": "Greek and Roman Art",
  "period": "Classical",
  "culture": "Greek",
  "objectDate": "5th century BCE",
  "creditLine": "Exact source credit line",
  "objectURL": "https://www.metmuseum.org/art/collection/search/123",
  "primaryImageSmall": "https://images.metmuseum.org/CRDImages/example.jpg"
}
```

The ID must be an integer; every other listed field is a string (empty if
unknown). Preserve museum text. The UI renders metadata as text and restricts
links/images to explicit HTTPS Met hosts. Do not replace absent periods with
invented dates or infer culture from query appearance.

The Python manifest contains `image` (local path relative to manifest) and
`object` (the full source record with `isPublicDomain: true`). The generator
rejects duplicate IDs and non-public-domain records. It does not fetch data,
choose departments or prove that the chosen local image belongs to the record;
verify those correspondences during collection preparation.

Normalization, 512-D projections, row order and byte order are mandatory.
The reader rejects nonfinite, zero and materially unnormalized rows and removes
float16 norm drift. Same-size mismatched JSON/binary pairs cannot be detected
by length checks: publish together and retain release hashes outside `public/`
or in dataset notes. No dataset-release manifest is generated automatically.
The generator writes temporary files first, then replaces each final file;
those two filesystem replacements are not a transaction. Stop the development
server during regeneration and use one Pages artifact for the finished pair.

## Recipe

Python uses `openai/clip-vit-base-patch32`, revision
`3d74acf9a28c67741b2f4f2ea7635f0aaf6f0268`. It applies EXIF orientation,
composites alpha over white, converts to RGB, caps the longest edge at 2048px,
then applies the model processor's resize, center crop, mean/std normalization,
and normalized image projection. Browser processing uses the corresponding
Xenova ONNX image projection and optional text projection, `quantized: false`.
JS/WASM is pinned to `@xenova/transformers@2.17.2`; the ONNX model revision
currently follows default upstream. Record and pin a tested revision for releases.

## Cross-runtime check

Install `scripts/requirements.txt` in a virtual environment, then:

```sh
python scripts/consistency.py prepare one.jpg two.jpg three.jpg four.jpg five.jpg
```

Five canonical, oriented, white-background PNGs and Python vectors are written
to `public/data/consistency/`. On the same static server, open `consistency.html`
(relative to the site/project root), run the check and download its JSON report.
The page uses the actual app worker and preprocessing, comparing each normalized
browser image vector with Python. Then run:

```sh
python scripts/consistency.py verify browser-consistency.json
```

All five cosines must be **strictly greater than 0.98**. The standard-library
verifier rejects missing/extra samples, nonfinite cosines and failed thresholds;
pytest checks that CLI contract using synthetic reports, not real embeddings.
The report itself is self-reported by the browser runner, not cryptographic
proof. Keep it with the fixture provenance, dataset hashes and model revisions.
Do not deploy private sample PNGs in `public/`.

**Not run yet:** no five real photos were supplied; torch/transformers are not
installed in the current workspace. No cross-model cosine results are claimed.

If it fails, compare projected `image_embeds`, not hidden states/logits; verify
both use ViT-B/32, matching weights and projection, full precision, RGB,
orientation, alpha treatment, resize/crop, mean/std and normalization. The
canonical PNGs isolate the initial resize; later browser/PIL resampling may
still differ. Check ONNX export against the original revision. For an existing
index built with another CLIP family, export that exact pipeline for JS or
regenerate all rows with this recipe. Do not lower the threshold to hide a mismatch.
