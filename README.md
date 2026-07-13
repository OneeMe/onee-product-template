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
├── docs/                    # Architecture and quality documentation
├── scripts/                 # Local automation
├── .github/                 # GitHub Actions
└── .githooks/               # Local git hooks
```

## Commands

```bash
npm install
npm run check
npm run type-check
npm run test
npm run build
```

## GitHub Template Setup

1. Create a GitHub repository from this local folder.
2. Make the repository public if it should be reused broadly.
3. In GitHub repository settings, enable **Template repository**.
4. Configure branch rules and required status checks for new projects after they are created.

See `docs/bootstrap.md` for the setup checklist.
