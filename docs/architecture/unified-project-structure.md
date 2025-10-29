# Unified Project Structure

```text
v-tool/
  .github/
    workflows/
      ci.yml
      deploy.yml
  apps/
    web/
      src/
        components/
        store/
        services/
        utils/
        main.ts
      index.html
      vite.config.ts
      tsconfig.json
      package.json
    api/                 # optional, future serverless/server app
      src/               # or functions/ for serverless
      package.json
  packages/
    engine/
      src/
      package.json
    shared/
      src/
        types.ts
      package.json
    export/              # optional later
      src/
      package.json
    ui/                  # optional later
      src/
      package.json
  package.json           # workspaces root
  tsconfig.base.json
  README.md
```

Notes
- Start with `apps/web` and `packages/shared`; add `engine` as the core grows, then extract as needed.
- Keep shared types in `packages/shared` to prevent drift and circular deps.
- Optional Turborepo can be added later for pipelines/caching.
