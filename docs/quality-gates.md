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

The empty template allows `e2e` and `eval` to report that no suites exist. That is a bootstrap state, not proof of integration coverage or model quality. Concrete projects should add suites as soon as those boundaries exist.

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

The separate `Model Eval` workflow runs `npm run eval` on `main` and by manual dispatch. Keep model credentials out of untrusted pull-request workflows. When a provider is selected, map its secrets only into the protected eval workflow and make missing credentials fail clearly.

Add project-specific implementation behind the stable commands when the stack is chosen:

- Playwright or another proven browser runner behind `npm run e2e`
- the selected model provider and evaluation harness behind `npm run eval`
- Database migration checks
- Docker image build
- Release validation
- Lighthouse or bundle-size checks
