# Bootstrap Checklist

Use this after creating a new project from the template.

## Repository

- Rename packages from `@template/*` to the project namespace.
- Update `README.md`.
- Choose whether `apps/web` should use Next.js, Vite, Astro, Remix, or another stack.
- Add required environment variables to `.env.example`.

## GitHub

- Make the repository public or private according to project needs.
- Enable **Template repository** only for repositories meant to be reused as templates.
- Add branch protection or repository rulesets.
- Require the `Quality` workflow before merging.
- Configure required secrets and environments.
- Decide whether releases are manual, tag-based, or automated.

## Local

```bash
npm install
npm run prepare
npm run check
```
