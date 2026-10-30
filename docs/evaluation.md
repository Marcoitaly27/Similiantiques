# Retrieval evaluation: 15-query protocol and results ledger

**Status: 0/15 queries executed.** Query photos and the real catalogue are not
available. Top-three IDs, scores and good/ok/bad judgments are pending; there
are no measured relevance scores or invented museum matches in this document.
The user will supply photos. This ledger is ready to complete once they arrive.

## Freeze the experiment before running

1. Record dataset release, SHA-256 hashes of both index files, object count,
   departments/counts and exclusions. A missing index is a prerequisite failure,
   not 15 bad retrieval judgments.
2. Record browser/OS, device/RAM where known, exact JS/WASM/model revisions,
   Python revision, download/cache state and the five-image consistency report.
   Require every cross-runtime cosine > 0.98 before using this as model evidence.
3. Use the supplied photos privately and record a neutral query description
   before seeing results. Obtain permission before publishing photos/screenshots.
4. Baseline Q01–Q14: text blank, weight 0, all filters. Q15 is the declared text
   refinement control below. Do not tune the catalogue after seeing these queries
   without labeling the run exploratory and repeating on a fresh holdout set.
5. Search in the actual browser app, save top three in displayed order, with
   objectID, title, museum URL, raw/displayed cosine and per-result grade.
   Record zero or fewer than three results rather than filling gaps. Capture
   error messages/timeouts separately from semantic judgments.

## Grade each result

* **Good:** an interpretable match in the requested object form and substantial
  visual features (e.g. silhouette plus ornament/material appearance).
* **OK:** a partial useful resemblance, such as shape alone or a related motif,
  but important visual structure differs.
* **Bad:** no useful visual resemblance, or mostly a background/color shortcut.

Judgment concerns visible resemblance only. A reproduction can be a good visual
match while proving nothing about age, provenance or authenticity. Do not grade
based on price or presumed authenticity. Prefer two independent raters, retaining
disagreements and reasons; if there is only one rater, disclose that limitation.

## Query plan and top-three ledger

Every `Pending` cell means **not run**, not good/ok/bad. Replace each top-three
cell with `objectID · title · score · good/ok/bad` and link to supporting evidence.
Keep failures and exclusions in place rather than silently substituting photos.

| ID | Photo to supply / declared intent | Top 1 | Top 2 | Top 3 | Status / stress case |
| --- | --- | --- | --- | --- | --- |
| Q01 | Plain terracotta two-handled vessel, side view on neutral background; silhouette | Pending | Pending | Pending | Baseline vessel |
| Q02 | Blue-and-white decorated bowl, rim visible; form and painted motif | Pending | Pending | Pending | Curved surface / decoration |
| Q03 | Gold-colored brooch with floral ornament; small decorative object | Pending | Pending | Pending | Color vs material ambiguity |
| Q04 | Brass-colored candlestick, full profile; stem and base shape | Pending | Pending | Pending | Tall narrow form |
| Q05 | Carved wooden face or small bust, frontal view; contour and carving | Pending | Pending | Pending | Sculpture / material appearance |
| Q06 | Woven geometric-pattern textile, flat and evenly lit; repeated motif | Pending | Pending | Pending | Pattern may beat object function |
| Q07 | Decorated spoon or small utensil, whole object; handle and bowl | Pending | Pending | Pending | Small details after center crop |
| Q08 | Translucent glass bottle with neck and stopper; profile | Pending | Pending | Pending | Transparency / background leakage |
| Q09 | Plain modern mass-produced mug; seek related vessel forms | Pending | Pending | Pending | Out-of-period negative control |
| Q10 | Known modern reproduction of antique-style jewelry; visual resemblance only | Pending | Pending | Pending | Authenticity cannot be inferred |
| Q11 | Reflective metal object with strong glare; same category as Q04 or Q07 | Pending | Pending | Pending | Highlights may dominate |
| Q12 | Q01 vessel photographed among unrelated items on a busy table | Pending | Pending | Pending | Clutter; compare with Q01 |
| Q13 | Q01 vessel in low light with cast shadow, without digital enhancement | Pending | Pending | Pending | Lighting; compare with Q01 |
| Q14 | Tight crop of Q03 ornament, excluding most silhouette | Pending | Pending | Pending | Partial view; compare with Q03 |
| Q15 | Same photo as Q01, description `terracotta, two handles`, text weight 25% | Pending | Pending | Pending | Text refinement; compare with Q01 |

Do not treat Q12–Q15 as independent examples for statistical confidence; they
are paired stress tests. Photo descriptions specify desired content, not claims
about the real objects. If a supplied photo differs, log its actual content and
amend the declared intent before searching.

## Per-query record template

```text
Query ID / photo reference (private path or consented public link):
Run timestamp / device / browser / dataset hashes / model revisions:
Photo dimensions / format / lighting / crop:
Text / weight / department / period / culture filters:
Cache cold or warm / download time / inference+ranking time:
1. objectID / title / objectURL / cosine / good|ok|bad / reason:
2. objectID / title / objectURL / cosine / good|ok|bad / reason:
3. objectID / title / objectURL / cosine / good|ok|bad / reason:
Errors / fewer results / rater(s) / disagreements / evidence:
```

## Failure cases: observed versus untested

| Case | Evidence now | Treatment |
| --- | --- | --- |
| Missing catalogue | Browser check displayed the explicit missing-data error | Blocked prerequisite; no ranks or relevance grades |
| HEIC input | Chromium input check displayed local JPEG conversion advice | Expected format rejection, not a semantic mismatch |
| Unavailable Python/browser references | Consistency page reported NOT VERIFIED | Cannot claim compatible embeddings yet |
| Ranking, filters, top-12, binary parsing | 11 Node tests passed; browser UI used synthetic data and a stub worker | Engineering checks only, no museum-quality judgments |
| Real Transformers.js preprocessing | RGB and 224×224 tensor check passed with downloaded 2.17.2 module | Weights and inference still untested |
| Reflections / clutter / low light / crop | Q11–Q14 not run | Report bad matches or runtime errors if observed |
| Modern object / reproduction | Q09–Q10 not run | Never interpret a match as authenticity or age evidence |
| English text refinement | Q15 not run | Report improvement, regression or no change |
| Slow/offline model / low-memory phone | No real weight-loading benchmark | Do not claim cached/offline/mobile readiness |

## Report after the run

Report completed/blocked/failed queries separately, and the top-1 good rate and
fraction with at least one good top-three match, using only completed queries
as the denominator and showing that denominator. Report per-rank grade counts,
rater disagreements, Q01/Q12/Q13 and Q03/Q14 comparisons, and Q01/Q15 changes.
Do not exclude bad examples to improve metrics. List catalogue gaps separately
from apparent model failures, without inventing a diagnosis from one score.
With 15 small, partly paired queries this is a qualitative pilot, not a benchmark
proving generalization or expertise. Current metrics: **not available (0 runs)**.
