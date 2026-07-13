# Onee Product Template

This repository is a public GitHub template for npm-workspace TypeScript projects.

The template intentionally leaves `apps/web` empty. Choose Next.js, Vite, Astro, Remix, or another web stack when a real project needs one.

## Structure

```text
onee-product-template/
├── apps/
│   ├── web/                 # Empty web app slot; choose a stack later
│   └── server/              # Optional backend service slot
├── packages/
│   ├── config/              # Shared configuration helpers
│   ├── database/            # Database schema/model/migration boundary
│   ├── domain/              # Business/domain logic
│   ├── testing/             # Shared test helpers
│   ├── ui/                  # Shared UI package, if needed
│   └── utils/               # Shared utilities
├── e2e/                     # Integration tests across system boundaries
├── evals/                   # Evaluations that call real models
├── docs/                    # Architecture and quality documentation
├── scripts/                 # Local automation
├── .github/                 # GitHub Actions
└── .githooks/               # Local git hooks
```

## Commands

```bash
npm install
npm run bootstrap -- --name my-product
npm run lint
npm run test
npm run e2e
npm run eval
npm run check
npm run build
```

The four quality contracts are stable: `lint` is static analysis, `test` is unit testing, `e2e` is integration testing, and `eval` runs real-model evaluations. `check` runs all four in that order. See `docs/quality-gates.md` for CI and credential boundaries.

`bootstrap` updates the root package name, workspace package scope, lockfile, and README. It then installs dependencies and runs the full quality gate. Use `--scope <scope>` or `--title <title>` when the defaults derived from the project name are not suitable.

## GitHub Template Setup

From `onee-workspace`, create and initialize a public product repository with one command:

```bash
make create-product name=my-product
```

For a repository created directly through GitHub's template interface, clone it and run the `bootstrap` command before beginning product work.

See `docs/bootstrap.md` for the setup checklist.
