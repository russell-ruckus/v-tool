# API Specification

N/A — Client-only MVP. No backend API is required per PRD and Tech Stack.

Future extension path (when adding sharing/analytics/preset sync):
- API Style Options: REST (OpenAPI), tRPC, or GraphQL.
- Auth Options: Cookie-based or token-based via managed provider (e.g., Supabase, Auth.js) if later needed.
- Data: Preset meta + user data in a hosted DB; scene JSON stored as documents or blobs.
- Recommendation if/when needed: Start with a minimal REST (OpenAPI) for portability and caching; introduce BFF if a public API emerges.
