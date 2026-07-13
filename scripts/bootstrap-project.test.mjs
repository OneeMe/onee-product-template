import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const script = resolve('scripts/bootstrap-project.mjs');

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'onee-product-bootstrap-'));

  await mkdir(join(root, 'apps/web'), { recursive: true });
  await mkdir(join(root, 'packages/ui'), { recursive: true });
  await writeJson(join(root, 'package.json'), {
    name: 'onee-product-template',
    description: 'A public GitHub template repository for npm-workspace TypeScript projects.',
    dependencies: {
      '@template/ui': 'workspace:*',
    },
    private: true,
    workspaces: ['apps/*', 'packages/*'],
  });
  await writeJson(join(root, 'apps/web/package.json'), {
    dependencies: {
      '@template/ui': 'workspace:*',
    },
    name: '@template/web',
    private: true,
  });
  await writeJson(join(root, 'packages/ui/package.json'), {
    name: '@template/ui',
    private: true,
  });
  await writeJson(join(root, 'package-lock.json'), {
    name: 'onee-product-template',
    lockfileVersion: 3,
    packages: {
      '': {
        dependencies: { '@template/ui': 'workspace:*' },
        name: 'onee-product-template',
      },
      'apps/web': {
        dependencies: { '@template/ui': 'workspace:*' },
        name: '@template/web',
      },
      'node_modules/@template/ui': { link: true, resolved: 'packages/ui' },
      'packages/ui': { name: '@template/ui' },
    },
  });
  await writeFile(
    join(root, 'README.md'),
    '# Onee Product Template\n\nThis repository is a public GitHub template.\n\n```text\nonee-product-template/\n```\n',
  );

  return root;
}

test('bootstrap command initializes project identity across workspace metadata', async (t) => {
  const root = await createFixture();
  t.after(() => rm(root, { force: true, recursive: true }));
  const result = spawnSync(
    process.execPath,
    [
      script,
      '--name',
      'acme-product',
      '--scope',
      'acme',
      '--title',
      'Acme Product',
      '--skip-install',
      '--skip-check',
    ],
    { cwd: root, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal((await readJson(join(root, 'package.json'))).name, 'acme-product');
  assert.equal((await readJson(join(root, 'package.json'))).description, 'Acme Product workspace.');
  assert.deepEqual((await readJson(join(root, 'package.json'))).dependencies, {
    '@acme/ui': 'workspace:*',
  });
  assert.equal((await readJson(join(root, 'apps/web/package.json'))).name, '@acme/web');
  assert.deepEqual((await readJson(join(root, 'apps/web/package.json'))).dependencies, {
    '@acme/ui': 'workspace:*',
  });
  assert.equal((await readJson(join(root, 'packages/ui/package.json'))).name, '@acme/ui');
  assert.equal((await readJson(join(root, 'package-lock.json'))).name, 'acme-product');
  assert.equal(
    (await readJson(join(root, 'package-lock.json'))).packages['packages/ui'].name,
    '@acme/ui',
  );
  assert.deepEqual(
    (await readJson(join(root, 'package-lock.json'))).packages['apps/web'].dependencies,
    { '@acme/ui': 'workspace:*' },
  );
  assert.deepEqual(
    (await readJson(join(root, 'package-lock.json'))).packages['node_modules/@acme/ui'],
    { link: true, resolved: 'packages/ui' },
  );
  assert.equal(
    (await readJson(join(root, 'package-lock.json'))).packages['node_modules/@template/ui'],
    undefined,
  );
  assert.match(await readFile(join(root, 'README.md'), 'utf8'), /^# Acme Product/m);
  assert.match(await readFile(join(root, 'README.md'), 'utf8'), /acme-product\//);
});

test('bootstrap command is idempotent for the same project identity', async (t) => {
  const root = await createFixture();
  t.after(() => rm(root, { force: true, recursive: true }));
  const args = [
    script,
    '--name',
    'acme-product',
    '--scope',
    'acme',
    '--skip-install',
    '--skip-check',
  ];

  const first = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' });
  const second = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' });

  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /No bootstrap changes were needed for acme-product/);
});

test('bootstrap command refuses custom workspace package names without partial writes', async (t) => {
  const root = await createFixture();
  t.after(() => rm(root, { force: true, recursive: true }));
  const rootManifestBefore = await readFile(join(root, 'package.json'), 'utf8');
  await writeJson(join(root, 'packages/ui/package.json'), {
    name: '@custom/ui',
    private: true,
  });

  const result = spawnSync(
    process.execPath,
    [script, '--name', 'acme-product', '--skip-install', '--skip-check'],
    { cwd: root, encoding: 'utf8' },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Refusing to replace custom workspace package name/);
  assert.equal(await readFile(join(root, 'package.json'), 'utf8'), rootManifestBefore);
});
