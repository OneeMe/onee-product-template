import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

function markdownSection(markdown, heading) {
  const marker = `## ${heading}`;
  const start = markdown.indexOf(marker);
  assert.notEqual(start, -1, `Missing markdown section: ${marker}`);
  const contentStart = start + marker.length;
  const nextSection = markdown.indexOf('\n## ', contentStart);
  return markdown.slice(contentStart, nextSection === -1 ? undefined : nextSection);
}

test('[template.docs-research-boundary] research evidence stays separate from product decisions', async () => {
  const [agents, research, product] = await Promise.all([
    readFile(resolve('AGENTS.md'), 'utf8'),
    readFile(resolve('docs/research.md'), 'utf8'),
    readFile(resolve('docs/product.md'), 'utf8'),
  ]);

  assert.match(research, /^# .+/m);
  assert.match(product, /^# .+/m);
  assert.match(product, /research\.md/);
  assert.match(agents, /`docs\/research\.md`/);
  assert.match(agents, /`docs\/product\.md`/);
  assert.match(agents, /Keep evidence and decisions separate:/);
  assert.notEqual(research, product);
});

test('[template.docs-project-context] setup requires the shared Project Mission context', async () => {
  const [agents, manifestText] = await Promise.all([
    readFile(resolve('AGENTS.md'), 'utf8'),
    readFile(resolve('package.json'), 'utf8'),
  ]);
  const context = markdownSection(agents, 'Project Context');
  const manifest = JSON.parse(manifestText);

  assert.match(context, /\*\*Background \/ Problem:\*\*/);
  assert.match(context, /\*\*Goal:\*\*/);
  assert.match(context, /\*\*Current Goal:\*\*/);
  assert.match(context, /\*\*Key Results:\*\*/);
  if (manifest.name === 'onee-product-template') {
    assert.match(context, /\bTBD\b/);
  } else {
    assert.doesNotMatch(context, /\bTBD\b/);
  }
  assert.match(agents, /Project setup is incomplete while any field remains `TBD`/);
});
