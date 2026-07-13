# Integration Tests

Place assembled-system and cross-boundary tests here. The stable command is:

```bash
npm run e2e
```

Use `*.test.ts` or `*.spec.ts`. These tests may exercise multiple workspaces, a real database in a disposable environment, HTTP boundaries, queues, or a browser after the web stack is selected. They must not call paid model APIs; model behavior belongs under `evals/`.

The empty template uses Vitest as a stack-neutral integration runner. A product may replace the underlying runner with Playwright or another proven tool, but it must preserve the `npm run e2e` command.
