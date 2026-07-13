# Quality Gates

The default local quality gate is:

```text
lint -> test -> e2e -> eval
```

Run it with:

```bash
npm run check
```

## Command Contracts

| Command        | Contract                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint` | Deterministic static checks: formatting, ESLint, and TypeScript. It must not call external services.                                 |
| `npm run test` | Fast unit tests for isolated functions, modules, and components. External systems and models should be replaced at their boundaries. |
| `npm run e2e`  | Integration tests across assembled application boundaries such as HTTP, database, queues, or browser flows.                          |
| `npm run eval` | Evaluations that call real models against representative inputs and explicit scoring thresholds.                                     |

`npm run build` remains available as a separate packaging/deployment check. It is not folded into one of the four quality meanings.

The template includes an integration test for its bootstrap command. Its stack-neutral application runner may still report no Vitest suites until an application stack exists. The empty `eval` suite is only a bootstrap state, not proof of model quality. Concrete projects should add application integration suites and real-model evals as soon as those boundaries exist.

## CI Gate

The `Quality` workflow runs deterministic gates on push and pull request:

```text
checkout
-> setup node
-> npm install
-> npm run lint
-> npm run test
-> npm run e2e
```

The separate `Model Eval` workflow runs `npm run eval` on `main` and by manual dispatch. Its job is bound to the `model-eval` GitHub Environment. Configure that environment to allow only `main`, add approval when appropriate, and store model credentials as environment secrets. Keep model credentials out of repository-level secrets and untrusted pull-request workflows. When a provider is selected, make missing credentials fail clearly.

Add project-specific implementation behind the stable commands when the stack is chosen:

- Playwright or another proven browser runner behind `npm run e2e`
- the selected model provider and evaluation harness behind `npm run eval`
- Database migration checks
- Docker image build
- Release validation
- Lighthouse or bundle-size checks
