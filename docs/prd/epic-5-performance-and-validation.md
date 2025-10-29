# Epic 5 Performance and Validation
Goal: Meet performance targets and polish validations for a reliable MVP.

## Story 5.1 Performance Tuning
As a user, I want smooth interactions up to ~5k instances, so that the tool feels responsive.

### Acceptance Criteria
1: Maintains ~60 FPS under typical interaction with 3–5k instances.
2: Uses rAF batching and style grouping where needed.
3: Preview density toggle available if instance counts exceed thresholds.

## Story 5.2 Validation and Error Messaging
As a user, I want clear feedback on invalid inputs and uploads, so that I can correct issues quickly.

### Acceptance Criteria
1: Parameter inputs validate with inline messages and safe clamping.
2: Upload errors provide actionable instructions.
3: No unhandled exceptions in common flows.

 
