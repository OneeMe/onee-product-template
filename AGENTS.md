# Agent Engineering Rules

## Project Shape

- Use `apps/*` for deployable or runnable applications.
- Use `packages/*` for reusable libraries and infrastructure.
- Keep the repository root for workspace config, CI, scripts, docs, and agent instructions only.
- Do not put product application source directly under root `src/`.

## Web App Slot

- `apps/web` is intentionally stack-neutral.
- Do not add Next.js, Vite, React, Astro, or any other web framework until the project chooses one explicitly.
- After a stack is chosen, keep framework-specific files inside `apps/web`.

## Quality Gates

Before considering work complete, run the narrowest relevant check. For broad changes, run:

```bash
npm run check
```

The default quality chain is:

```text
format:check -> lint -> type-check -> test -> build
```

## Directory Boundaries

- `apps/web`: user-facing web product.
- `apps/server`: backend service or API runtime.
- `packages/domain`: pure business rules.
- `packages/database`: persistence schema, migrations, models, repositories.
- `packages/ui`: reusable UI primitives/components.
- `packages/config`: typed shared configuration.
- `packages/testing`: test helpers and fixtures.
- `packages/utils`: small framework-agnostic utilities.

Keep features close to the app that owns them. Extract into `packages/*` only when code is reused or represents a stable boundary.
