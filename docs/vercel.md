# Deploy on Vercel

This app is a static site. The Python files only build/evaluate the museum
index offline; they are not a web server or Vercel Functions.

## Build Output API

Root `vercel.json` selects no framework (`framework: null`), skips dependency
installation, and runs `node tools/build-vercel.mjs`. This dependency-free
packaging step copies `public/` into `.vercel/output/static/` and writes
`.vercel/output/config.json` with `{ "version": 3 }`. The configured Output
Directory is `.vercel/output`, the Vercel Build Output API artifact.
There is no frontend bundling, compilation, Python runtime or serverless function.

`.vercelignore` excludes offline Python tooling/tests and development files
from the Vercel upload, while retaining `tools/build-vercel.mjs`.
Only generated `.vercel/output/` is replaced; linked-project settings under
`.vercel/project.json` are preserved. Run `npm run build:vercel` locally to
inspect the artifact. These files do not affect GitHub Pages or index generation.

## Project settings and redeploy

1. Import `Marcoitaly27/Similiantiques` with **Root Directory = repository root**,
   not `scripts/` or `public/`, so Vercel reads the root configuration.
2. Use **Framework Preset = Other**. Remove conflicting build/output overrides:
   the checked-in config specifies the packaging command and `.vercel/output`.
   In particular, do not retain the old empty build command / `public` output.
3. Deploy the latest `main` commit. A connected Git project should deploy new
   pushes automatically; otherwise redeploy the latest commit in Vercel.
4. Logs should show `Static site packaged at .../.vercel/output/static/`.
   Check output includes `static/index.html` and `static/src/model-worker.js`,
   and no warning about missing `functions`, `static`, or `services` directories.
5. Open the unique deployment URL first, then the production domain. If only
   the production domain fails, check its assignment and production promotion.

## Observed failures

* Commit `8eceeda`: `PYTHON_ENTRYPOINT_NOT_FOUND`. Vercel inferred a Python
  application; explicit static framework settings and exclusions addressed that.
* Commit `35d000d`: build succeeded in 34 ms, but warned that output contained
  no `functions`, `static`, or `services`. This empty deployment explains the
  root 404. The earlier empty build command / output-directory configuration
  did not produce a deployable artifact in the reported environment.
* The explicit Build Output API packaging replaces that configuration and has
  regression tests for a complete artifact, repeated builds and project settings.
  Vercel CLI 65.4.0 was run locally against isolated project settings: it
  completed successfully and emitted all 23 public files, byte-identical, under
  `static/`. All 13 JavaScript tests passed. Hosted success still requires
  confirmation from the next Vercel deployment.

The museum index remains a separate prerequisite: supply real
`public/data/objects.json` and `embeddings.bin` and complete the consistency and
relevance checks in the README. Do not deploy private test images in `public/`.
