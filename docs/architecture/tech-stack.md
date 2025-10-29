# Tech Stack

The following selections are optimized for a client-only, pure-SVG MVP with fast iteration and minimal ops. Versions are proposed; confirm or adjust and we’ll lock them.

| Category             | Technology                         | Version  | Purpose                                   | Rationale |
|----------------------|------------------------------------|----------|-------------------------------------------|-----------|
| Frontend Language    | TypeScript                         | 5.6.x    | Type safety across engine/UI               | Mature, great tooling, helps prevent regressions |
| Frontend Framework   | None (Vanilla TS + Vite)           | -        | Minimal SPA shell                          | PRD states no framework needed; reduce overhead |
| UI Component Library | Tweakpane                           | 4.x      | Parameter panels and bindings               | Lightweight, focused control panes; great ergonomics for creative tools |
| State Management     | Lightweight custom store (observable) | 0.1     | Centralized app state                      | Unidirectional flow, tiny surface area |
| Backend Language     | N/A (client-only MVP)              | -        | -                                         | No backend per PRD |
| Backend Framework    | N/A (client-only MVP)              | -        | -                                         | - |
| API Style            | None (no API in MVP)               | -        | -                                         | Client-only; can add later |
| Database             | N/A                                 | -        | -                                         | - |
| Cache                | N/A                                 | -        | -                                         | - |
| File Storage         | N/A                                 | -        | -                                         | - |
| Authentication       | N/A                                 | -        | -                                         | - |
| Frontend Testing     | Vitest + Testing Library           | latest   | Unit/component tests                       | Fast DX; aligns with Vite |
| Backend Testing      | N/A                                 | -        | -                                         | - |
| E2E Testing          | Playwright                         | latest   | Browser automation & parity checks         | Reliable cross-browser testing |
| Build Tool           | Vite                                | 5.x      | Dev server and build                       | Fast HMR, optimized build |
| Bundler              | esbuild (dev) + Rollup (prod)      | bundled  | Transform/bundle                            | Vite defaults; proven setup |
| IaC Tool             | None (MVP)                          | -        | -                                         | Static hosting only |
| CI/CD                | GitHub Actions                      | -        | Build + preview + deploy                   | Simple, ubiquitous |
| Monitoring           | Optional: Sentry (frontend)         | latest   | Error tracking (stretch)                   | Useful, but can defer |
| Logging              | Console + structured event logs     | -        | Minimal runtime insights                    | Lightweight for MVP |
| CSS Framework        | Tailwind CSS (optional)             | 3.x      | Quick, consistent UI                       | Speeds panel layout; can omit if desired |

Notes
- If you prefer React or Svelte, we can swap “None” for React 18.x or Svelte 5 and adjust state/testing accordingly.
- If platform is Vercel, CI can be either GitHub Actions or Vercel’s built-in; keeping Actions for portability.
