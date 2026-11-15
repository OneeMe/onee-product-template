import assert from 'node:assert/strict';
import { access, copyFile, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import test from 'node:test';

import { runCommand } from '../support/run-command.mjs';
import { createTempWorkspace } from '../support/temp-workspace.mjs';

const script = resolve('scripts/update-quality-baselines.mjs');

async function createTestProject(t) {
  const workspace = await createTempWorkspace('onee-coverage-gate-');
  const { root } = workspace;
  t.after(workspace.cleanup);
  const manifest = JSON.parse(await readFile(resolve('package.json'), 'utf8'));
  await mkdir(join(root, 'scripts'), { recursive: true });
  await mkdir(join(root, 'apps/server/src'), { recursive: true });
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({
      name: 'coverage-fixture',
      private: true,
      type: 'module',
      scripts: manifest.scripts,
    }),
  );
  await copyFile(resolve('vitest.config.ts'), join(root, 'vitest.config.ts'));
  await copyFile(script, join(root, 'scripts/update-quality-baselines.mjs'));
  await symlink(resolve('node_modules'), join(root, 'node_modules'), 'junction');
  await writeFile(join(root, 'apps/server/src/example.ts'), 'export const value = 42;\n');
  await writeFile(
    join(root, 'apps/server/src/example.test.ts'),
    "import { expect, test } from 'vitest';\nimport { value } from './example';\ntest('value', () => expect(value).toBe(42));\n",
  );
  return root;
}

test('[template.coverage-disabled-default] local and CI tests leave coverage and baselines untouched', async (t) => {
  const root = await createTestProject(t);
  const baseline = join(root, 'apps/server/.quality-baseline/test-coverage.json');
  await mkdir(join(root, 'apps/server/.quality-baseline'), { recursive: true });
  const previous = '{"existingBaseline":"unchanged"}\n';
  await writeFile(baseline, previous);

  for (const ci of ['', '1']) {
    const result = runCommand('npm', ['run', 'test'], {
      cwd: root,
      env: { ...process.env, CI: ci },
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.doesNotMatch(result.stdout, /Module coverage baselines/);
    await assert.rejects(access(join(root, 'coverage')), { code: 'ENOENT' });
    assert.equal(await readFile(baseline, 'utf8'), previous);
  }
});

test('[template.coverage-maintainer-activation] maintainer opt-in enables measurements and CI baseline checks', async (t) => {
  const root = await createTestProject(t);
  const activation = runCommand('npm', ['pkg', 'set', 'scripts.test=npm run test:coverage'], {
    cwd: root,
  });
  assert.equal(activation.status, 0, activation.stderr);

  const local = runCommand('npm', ['run', 'test'], {
    cwd: root,
    env: { ...process.env, CI: '' },
  });
  assert.equal(local.status, 0, local.stdout + local.stderr);
  const baseline = join(root, 'apps/server/.quality-baseline/test-coverage.json');
  const measured = JSON.parse(await readFile(baseline, 'utf8'));
  assert.equal(measured.status, 'measured');
  assert.equal(measured.coverage.lines.pct, 100);

  const currentCi = runCommand('npm', ['run', 'test'], {
    cwd: root,
    env: { ...process.env, CI: '1' },
  });
  assert.equal(currentCi.status, 0, currentCi.stdout + currentCi.stderr);

  await writeFile(baseline, '{}\n');
  const staleCi = runCommand('npm', ['run', 'test'], {
    cwd: root,
    env: { ...process.env, CI: '1' },
  });
  assert.equal(staleCi.status, 1);
  assert.match(staleCi.stderr, /Coverage baselines are stale/);
});

function metric(total, covered) {
  return {
    covered,
    pct: total === 0 ? 'Unknown' : (covered / total) * 100,
    skipped: 0,
    total,
  };
}

function coverage({ branches, functions, lines, statements }) {
  return {
    branches: metric(...branches),
    functions: metric(...functions),
    lines: metric(...lines),
    statements: metric(...statements),
  };
}

test('[template.coverage-baseline-modules] coverage summary is persisted per app and package module', async (t) => {
  const workspace = await createTempWorkspace('onee-quality-baseline-');
  const { root } = workspace;
  t.after(workspace.cleanup);

  await mkdir(join(root, 'apps/ios'), { recursive: true });
  await mkdir(join(root, 'apps/server/src'), { recursive: true });
  await mkdir(join(root, 'packages/utils/src'), { recursive: true });
  await mkdir(join(root, 'coverage'), { recursive: true });
  await writeFile(
    join(root, 'coverage/coverage-summary.json'),
    `${JSON.stringify({
      total: coverage({
        branches: [6, 4],
        functions: [4, 3],
        lines: [12, 8],
        statements: [12, 8],
      }),
      [join(root, 'apps/server/src/index.ts')]: coverage({
        branches: [4, 2],
        functions: [2, 1],
        lines: [10, 5],
        statements: [10, 5],
      }),
      [join(root, 'packages/utils/src/index.ts')]: coverage({
        branches: [2, 2],
        functions: [2, 2],
        lines: [2, 2],
        statements: [2, 2],
      }),
    })}\n`,
  );

  const result = runCommand(
    process.execPath,
    [script, '--root', root, '--summary', 'coverage/coverage-summary.json'],
    { encoding: 'utf8', env: { ...process.env, CI: '' } },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /apps\/server\s+50\.00%\s+50\.00%/);
  assert.match(result.stdout, /packages\/utils\s+100\.00%\s+100\.00%/);

  const server = JSON.parse(
    await readFile(join(root, 'apps/server/.quality-baseline/test-coverage.json'), 'utf8'),
  );
  assert.equal(server.status, 'measured');
  assert.deepEqual(server.coverage.lines, { covered: 5, pct: 50, total: 10 });

  const ios = JSON.parse(
    await readFile(join(root, 'apps/ios/.quality-baseline/test-coverage.json'), 'utf8'),
  );
  assert.equal(ios.status, 'no-measurable-source');
  assert.deepEqual(ios.coverage.lines, { covered: 0, pct: null, total: 0 });

  const currentInCi = runCommand(
    process.execPath,
    [script, '--root', root, '--summary', 'coverage/coverage-summary.json'],
    { encoding: 'utf8', env: { ...process.env, CI: '1' } },
  );
  assert.equal(currentInCi.status, 0, currentInCi.stderr);

  const summaryPath = join(root, 'coverage/coverage-summary.json');
  const changedSummary = JSON.parse(await readFile(summaryPath, 'utf8'));
  const serverPath = join(root, 'apps/server/src/index.ts');
  changedSummary[serverPath].lines.covered = 4;
  changedSummary[serverPath].statements.covered = 4;
  await writeFile(summaryPath, `${JSON.stringify(changedSummary)}\n`);

  const staleInCi = runCommand(
    process.execPath,
    [script, '--root', root, '--summary', 'coverage/coverage-summary.json'],
    { encoding: 'utf8', env: { ...process.env, CI: '1' } },
  );
  assert.equal(staleInCi.status, 1);
  assert.match(staleInCi.stderr, /Coverage baselines are stale/);
});
