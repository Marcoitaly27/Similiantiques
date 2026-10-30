import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function files(root, prefix = '') {
  const output = [];
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const name = join(prefix, entry.name);
    if (entry.isDirectory()) output.push(...await files(root, name));
    else output.push(name);
  }
  return output.sort();
}

async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'simili-build-test-'));
  try {
    await mkdir(join(root, 'tools'));
    await cp(new URL('../tools/build-vercel.mjs', import.meta.url), join(root, 'tools/build-vercel.mjs'));
    await cp(new URL('../public/', import.meta.url), join(root, 'public'), { recursive: true });
    await mkdir(join(root, '.vercel'));
    await writeFile(join(root, '.vercel/project.json'), '{"localFixture":true}\n');
    const build = () => execFileSync(process.execPath, [join(root, 'tools/build-vercel.mjs')], { cwd: tmpdir() });
    await run(root, build);
  } finally { await rm(root, { recursive: true, force: true }); }
}

test('Vercel packaging emits a complete version-3 static site from any cwd', async () => {
  await fixture(async (root, build) => {
    build();
    const output = join(root, '.vercel/output');
    const config = JSON.parse(await readFile(join(output, 'config.json'), 'utf8'));
    assert.equal(config.version, 3);
    assert.deepEqual(await files(join(output, 'static')), await files(join(root, 'public')));
    for (const name of ['index.html', 'styles.css', 'src/app.js', 'src/model-worker.js']) {
      assert.deepEqual(await readFile(join(output, 'static', name)), await readFile(join(root, 'public', name)));
    }
    assert.equal(await readFile(join(root, '.vercel/project.json'), 'utf8'), '{"localFixture":true}\n');
    assert.ok(!(await files(join(output, 'static'))).some(name => name.endsWith('.py')));
  });
});

test('rebuilding removes stale deployable output while preserving project settings', async () => {
  await fixture(async (root, build) => {
    build();
    const stale = join(root, '.vercel/output/static/stale.html');
    await writeFile(stale, 'old generated file');
    build();
    assert.ok(!(await files(join(root, '.vercel/output/static'))).includes('stale.html'));
    assert.equal(await readFile(join(root, '.vercel/project.json'), 'utf8'), '{"localFixture":true}\n');
  });
});
