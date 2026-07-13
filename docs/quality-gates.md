# Quality Gates

The default local quality gate is:

```text
format:check
-> lint
-> type-check
-> test
-> build
```

Run it with:

```bash
npm run check
```

## CI Gate

The default GitHub Actions workflow runs the same checks on push and pull request:

```text
checkout
-> setup node
-> npm install
-> npm run check
```

Add project-specific gates when the stack is chosen:

- Web browser E2E tests
- Database migration checks
- Docker image build
- Release validation
- Lighthouse or bundle-size checks
