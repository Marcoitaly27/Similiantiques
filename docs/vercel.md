# Deploy on Vercel

This app is a static site. The Python files only build/evaluate the museum
index offline; they are not a web server or Vercel Functions.

## Repository configuration

Root `vercel.json` explicitly selects no framework (`framework: null`), disables
installation and build commands, and publishes `public/` as the output directory.
`.vercelignore` excludes offline Python tooling/tests and development files from
the Vercel upload. No Python entrypoint or serverless function is needed.
These files do not affect the GitHub Pages workflow or local index generation.

## Project settings and redeploy

1. Import `Marcoitaly27/Similiantiques` with **Root Directory = repository root**,
   not `public/`, so Vercel reads the root configuration.
2. Use **Framework Preset = Other**. The checked-in configuration supplies empty
   build/install commands and **Output Directory = public**; remove conflicting
   project overrides or custom configuration paths if previously configured.
3. Deploy the latest `main` commit. A connected Git project should deploy new
   pushes automatically; otherwise use Redeploy for the latest commit in Vercel.
4. Confirm build logs no longer detect a Python application and the deployment
   serves `index.html`, `src/app.js`, and `src/model-worker.js` as static files.
5. Check the live UI and run a real photo search once the museum index exists.

The original deployment at commit `8eceeda` failed with
`PYTHON_ENTRYPOINT_NOT_FOUND`: Vercel inferred a Python app from the repository's
Python tooling. Adding a dummy `app.py` would introduce an unnecessary backend;
explicit static configuration addresses that classification instead.

## Validation and remaining data requirements

Local checks can confirm the JSON configuration, output directory and static
entry files. A successful hosted redeployment still needs confirmation from
Vercel's logs; no Vercel project credentials are available in this workspace.
A deployment of the UI alone is not a working museum search: supply real
`public/data/objects.json` and `embeddings.bin`, example photos, and complete the
consistency/evaluation checks described in the main README. Do not deploy
private evaluation images under `public/`.
