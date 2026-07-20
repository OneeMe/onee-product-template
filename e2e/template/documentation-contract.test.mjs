import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

test('[template.docs-research-boundary] research evidence stays separate from product decisions', async () => {
  const research = await readFile(resolve('docs/research.md'), 'utf8');
  const product = await readFile(resolve('docs/product.md'), 'utf8');

  assert.match(research, /^# Product Research/m);
  assert.match(research, /primary-source findings/);
  assert.match(product, /^# Product Definition/m);
  assert.match(product, /research\.md/);
  assert.match(product, /## Positioning/);
  assert.match(product, /## MVP scope/);
});

test('[template.docs-project-context] setup requires the shared Project Mission context', async () => {
  const agents = await readFile(resolve('AGENTS.md'), 'utf8');

  assert.match(agents, /## Project Context/);
  assert.match(agents, /\*\*Background \/ Problem:\*\* TBD/);
  assert.match(agents, /\*\*Goal:\*\* TBD/);
  assert.match(agents, /\*\*Current Goal:\*\* TBD/);
  assert.match(agents, /\*\*Key Results:\*\*/);
  assert.match(agents, /Project setup is incomplete while any field remains `TBD`/);
});
