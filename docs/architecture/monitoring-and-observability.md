# Monitoring and Observability

Monitoring Stack
- Frontend Monitoring: Optional Sentry SDK for error tracking (post-MVP)
- Performance Monitoring: Core Web Vitals via `web-vitals` with console or lightweight analytics (opt-in)
- Logging: Structured console logs during development; no PII

Key Metrics
- Core Web Vitals (LCP/CLS/INP)
- JavaScript errors rate
- Export latency (preview→SVG generation)
- Instance count vs FPS during interaction
