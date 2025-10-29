# CI/CD

Pipeline
- CI: Install, type-check, lint, unit tests, build (Vite) on PRs.
- E2E: Playwright smoke on main on demand (or nightly).
- Deploy: On main merge → Vercel static deploy (or Netlify). Previews on PRs.

Example GitHub Actions (ci.yml)
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run typecheck --workspaces
      - run: npm run lint --workspaces || true
      - run: npm test --workspaces --if-present
      - run: npm run -w apps/web build
```
