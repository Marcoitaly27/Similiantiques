# Release readiness, rights and performance estimates

## Verified and unresolved

Local validation: 15 pytest CLI-contract cases and 11 Node ranking/parser cases
passed. The app shell and input-handling paths were previously exercised in Chromium.
Real CLIP model weights/inference, cross-runtime equivalence, relevance, dataset
coverage, hosted performance and low-memory phone behavior remain unverified.
No real `objects.json`, `embeddings.bin`, example photos or demo GIF exist yet.
The 15-query ledger is explicitly 0/15 run. Python tests validate the report
verifier, not the Python embedding pipeline or ONNX export.

Before claiming a working public collection search: supply permitted data/photos,
freeze model and dataset revisions, pass five-image consistency, run/grade the
15 queries, and measure cold/warm behavior on target desktop and mobile devices.
The current browser model follows default upstream; reproducible releases require
pinning a tested revision. Department scope remains a proposal, not a curated index.

## License and attribution questions

* The Met's Open Access CC0 applies to eligible public-domain collection material;
  it is not blanket permission for all museum images or trademarks. Preserve
  source credit lines, verify each image's status and retain rights provenance.
* The API's `isPublicDomain` flag is a practical filter, not legal advice or a
  substitute for checking the selected image and intended use against the policy.
* Transformers.js is Apache-2.0, OpenAI CLIP is MIT; review the exact Xenova model
  card, ONNX Runtime and bundled notices before redistributing their artifacts.
  Third-party dependencies are not relicensed by the museum's CC0 policy.
* Example/query photos need permission to publish. Photographs of private people,
  homes or documents should not be placed in public evaluation fixtures.
* Another museum needs its own rights checks and credits. Do not map another
  institution's rights to Met CC0 automatically.
* This repository has no project code license selected. The owner must choose
  one; neither a public repository nor the included original illustrations imply
  a specific reuse grant. No license has been invented on the owner's behalf.

## Rough index size

No index is present, so these are formulas/estimates, **not measurements**.
Each object uses `512 * 2 = 1,024` binary bytes (1 KiB):

| Objects | Float16 binary | Estimated JSON at 0.5–1.5 KB/object | Combined transfer before compression |
| --- | --- | --- | --- |
| 1,000 | 1.024 MB | 0.5–1.5 MB | 1.5–2.5 MB |
| 10,000 | 10.24 MB | 5–15 MB | 15–25 MB |
| 50,000 | 51.2 MB | 25–75 MB | 76–126 MB |
| 100,000 | 102.4 MB | 50–150 MB | 152–252 MB |

MB is decimal here. Metadata size depends heavily on URLs/credit lines and
compression. Images are hotlinked, not in this index; top-12 thumbnails add
uncounted transfer. A 10,000-object binary expands to about 20.48 MB of float32
vectors in memory, temporarily alongside the downloaded binary and JSON/objects.
The CLIP models, activations, canvas and decoding buffers add substantially more.

## Load-time estimates

The two full-precision encoders total roughly **600 MB**, separate from index,
JS/WASM and museum images. This remains an approximate upstream-model estimate;
no complete cold model download has been measured in this workspace.

For planning, download seconds ≈ `bytes * 8 / bits_per_second`. A 600 MB model
plus a 15–25 MB index (10,000 objects) has these ideal transfer times:

| Sustained connection | Model + index download lower-bound estimate |
| --- | --- |
| 10 Mbit/s | 8.2–8.3 minutes |
| 50 Mbit/s | 98–100 seconds |
| 100 Mbit/s | 49–50 seconds |

These ignore latency, throttling, CDN behavior, JS/WASM, thumbnails, decoding,
initialization and inference. They are neither an SLA nor a hosted benchmark.
The app has a 10-minute model/inference timeout, so slow links may fail. A warm
model cache can avoid weight transfer but still requires local initialization
and computation. No credible warm inference duration can be stated without a
target-device run; do not substitute a stub-worker UI timing.

Measure with DevTools network/performance and a stopwatch from file selection to
results, separately recording download, model initialization, inference, ranking,
and first visible museum image. Clear Cache Storage for cold tests; retain it for
warm tests. Record device/browser, data size, exact model revision and connection.
Cache eviction, no internet and private browsing should be separate cases.

## CI and deployment status

CI installs only pytest and runs its CLI-contract suite and `node --test` on
all pushes/pull requests. Pages also invokes that reusable test workflow before
deployment. Passing CI does not run heavy model inference or the 15-query study.
GitHub-hosted CI and Pages have not been executed from this workspace; the local
commands are the available evidence. Setup and deployment steps are in the README.
