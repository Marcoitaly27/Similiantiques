// Vercel-only packaging. The application itself remains unbundled static files.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = new URL('../public/', import.meta.url);
const output = new URL('../.vercel/output/', import.meta.url);
// Fail before removing previous generated output if the entry page is missing.
await readFile(new URL('index.html', source));
// Only replace generated build output; preserve .vercel/project.json and env files.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, new URL('static/', output), { recursive: true });
await writeFile(new URL('config.json', output), JSON.stringify({ version: 3 }, null, 2) + '\n');
console.log(`Static site packaged at ${fileURLToPath(new URL('static/', output))}`);
