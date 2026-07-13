# Architecture

## Repository Layers

```text
apps/*       = deployable or runnable applications
packages/*   = reusable libraries and stable internal boundaries
docs/*       = durable project knowledge
scripts/*    = local automation
.github/*    = CI/CD and collaboration automation
```

## Default Application Layout

When a web stack is selected for `apps/web`, prefer this internal shape:

```text
apps/web/
├── src/
│   ├── app/          # framework router or app shell
│   ├── routes/       # thin route segments
│   ├── features/     # business feature modules
│   ├── services/     # client-side API wrappers
│   ├── store/        # client state
│   └── styles/       # app-level styles
└── package.json
```

Keep route files thin. Move business logic into `features`, shared logic into `packages/domain`, and cross-app utilities into `packages/utils`.
