# Design decisions

Status: implementation choices below exist in code; catalogue scope is proposed.
No real index, query photographs or curator judgments have been supplied.

## Static site and client-side inference

A GitHub Pages site needs no application server, credentials, image-upload
storage or per-query inference bill. Sending only public model/catalogue assets
to the visitor preserves the private-photo workflow. Plain ES modules avoid a
build pipeline and make the deployed artifact directly inspectable.

The tradeoff is a large first download, browser-dependent memory/CPU, exposure
of the public index, and no central GPU or private catalogue. Client-side
ranking is exhaustive; very large collections may need a different retrieval
strategy. External JS/model delivery remains a supply-chain dependency.
No service worker is installed, so cache persistence is not an offline guarantee.

## CLIP ViT-B/32

It provides image and text projections in the same 512-dimensional space,
allowing photo search and weighted descriptions without training a new model.
The requested Xenova export is available through Transformers.js and maps to
the original OpenAI CLIP weights used by the Python pipeline. ViT-B/32 is a
practical baseline with a smaller footprint than larger CLIP variants.

It was selected for compatibility and feasibility, **not because evaluation
proved it best for antiques**. Its internet-trained features emphasize visual
shape, color, style and image context. Patch size and preprocessing can hide
small maker marks, condition or construction details. It is not a connoisseur.

The browser uses exact Transformers.js 2.17.2 and `quantized: false`. Full
precision avoids adding quantization differences to the Python comparison,
but costs roughly 600 MB across image/text encoders and substantial RAM.
Single-thread WASM works without cross-origin-isolation headers on Pages.
The browser's model revision still needs pinning after compatibility is tested.

## Float16 index, float32 arithmetic

A normalized 512-D vector costs 1,024 bytes in float16 versus 2,048 in float32.
This halves vector transfer/storage while retaining more precision than an
integer-quantized index. Decoding into float32 keeps ranking simple and portable
with ordinary typed arrays. No index compression dependency is required.

The reader checks exact byte count, finite values and near-unit row norms;
it renormalizes the small drift from float16 rounding. Headerless little-endian
rows simplify parsing but rely on metadata order and the fixed 512-D contract.
Tie-breaking preserves row order. Real top-k stability against a float32 index
has **not** been measured; near ties can swap. Float16 is a storage decision,
separate from the unquantized ONNX model setting.

## Why these departments?

**There is no selected department list yet.** Filters are populated from whatever
real records the index contains; the generator does not enforce department quotas.
The department names in unit tests and documentation are fixtures/examples,
not evidence of a curated museum subset.

Proposed starting scope for an object-focused pilot:

| Department | Why consider it | Coverage risk |
| --- | --- | --- |
| Greek and Roman Art | Vessel profiles, sculpture, jewelry | Archaeological forms may dominate everyday objects |
| European Sculpture and Decorative Arts | Furniture, metalwork, ornament | Ornate studio photographs may create background bias |
| Asian Art | Ceramics, textiles, varied object traditions | A very broad department needs balanced sampling |
| Islamic Art | Metalwork, vessels and repeating ornament | Pattern resemblance can obscure different functions |
| Medieval Art | Carving, small sculpture and metal objects | Religious iconography may dominate weak form matches |

These are scope hypotheses for visual breadth, not cultural or authenticity
labels inferred from a visitor's object. Before building, inspect actual
public-domain image availability, remove duplicates and unusable photos,
record included IDs/counts and exclusions, and agree a balanced pilot scope.
The initial implementation allows all departments; a curated choice belongs
in the manifest and its accompanying dataset-release notes.

## Failures observed and responses

| Observed issue | Response | Current limit |
| --- | --- | --- |
| Empty repository and no museum dataset | Built a static shell, strict schema reader, Python generator and visible missing-catalogue error | No actual retrieval-quality result exists |
| No real example photos | Added six disabled original illustrations with explicit placeholder status | Add permitted photos before claiming interactive examples |
| HEIC is not reliably decodable by this flow | Detect HEIC/HEIF and explain local JPEG export; verified the error in Chromium | Native HEIC conversion is not implemented |
| File-level Node reporter hid individual test names in this host | Also ran the test file directly; it reported 11 passing cases | CI retains the requested standard `node --test` command |
| A temporary browser QA helper used `CLIPImageProcessor`, absent in 2.17.2 | Changed that helper to this release's `CLIPFeatureExtractor`; actual RGB/preprocessing check passed | App uses `AutoProcessor`; no model-weight inference was validated |
| Five-image consistency references and Python ML dependencies absent | Added prepare/browser-run/verify tooling and documented the unrun check | Compatibility remains unresolved, not a reported success |

No measured relevance failure or cross-model mismatch has been discovered yet;
neither has been tested on real query photographs. Expected failures such as
background bias and reproduction confusion are hypotheses in the evaluation
plan, not invented incidents. Tooling/format checks do not establish art expertise.
