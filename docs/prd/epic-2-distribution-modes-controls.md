# Epic 2 Distribution Modes & Controls
Goal: Add Sine path and Particle distributions with transform controls for depth and rotation.

## Story 2.1 Sine Path Sampler
As a user, I want a sine path distribution, so that I can create wavy patterns.

### Acceptance Criteria
1: Sine sampler positions instances along a sine curve with adjustable frequency/amplitude.
2: Works with spacing functions consistently.
3: Deterministic placement given the same parameters.

## Story 2.2 Particle: Grid Jitter
As a user, I want a jittered grid distribution, so that I can create structured yet varied layouts.

### Acceptance Criteria
1: Grid density and jitter controls update instance positions smoothly.
2: Maintains ~60 FPS up to ~5k instances in this mode.
3: Deterministic with a given seed.

## Story 2.3 Particle: Random Scatter
As a user, I want random scatter, so that I can create organic distributions.

### Acceptance Criteria
1: Scatter respects density bounds and viewport/canvas constraints.
2: Deterministic with seed; updates smoothly on parameter changes.
3: No visual overlap artifacts beyond expected randomness.

## Story 2.4 Depth→Scale and Rotation Controls
As a user, I want depth mapped to scale and adjustable rotation, so that I can add depth and variation.

### Acceptance Criteria
1: Depth parameter maps to scale with configurable range.
2: Rotation supports fixed value and randomized range (seeded).
3: Render order remains visually consistent relative to depth.
