# Frontend Architecture

## Component Architecture
Component Organization
```text
apps/web/
  src/
    components/
      panels/
        ObjectPanel.ts
        DistributionPanel.ts
        TransformPanel.ts
        StylingPanel.ts
        ViewportPanel.ts
        ExportPanel.ts
        PresetsPanel.ts
      canvas/
        Canvas.ts
        CanvasControls.ts
        ViewportOverlay.ts
      common/
        Slider.ts
        NumberInput.ts
        ColorInput.ts
        Toggle.ts
    store/
      store.ts
      selectors.ts
      validators.ts
    services/
      presets.ts
      export.ts
      upload.ts
    utils/
      rng.ts
      svg.ts
    main.ts
```

Component Template
```ts
// apps/web/src/components/panels/DistributionPanel.ts
import { Pane } from 'tweakpane';
import { getState, update, subscribe } from "../../store/store";
import type { Distribution } from "@shared/types";

export function DistributionPanel(root: HTMLElement) {
  const pane = new Pane({ container: root, title: 'Distribution' });
  const state = getState();

  const params = {
    instances: state.distribution.mode === 'path' ? state.distribution.path.instances : 100,
    spacing: state.distribution.mode === 'path' ? state.distribution.spacing : 'linear',
  } as { instances: number; spacing: 'linear'|'ease-in'|'ease-out' };

  pane.addBinding(params, 'instances', { min: 0, step: 1, label: 'Instances' }).on('change', (ev) => {
    if (getState().distribution.mode === 'path') {
      const d = getState().distribution as Extract<Distribution, { mode: 'path' }>;
      update({ distribution: { ...d, path: { ...d.path, instances: Math.max(0, Math.floor(ev.value)) } } as Distribution });
    }
  });

  pane.addBinding(params, 'spacing', { options: { Linear: 'linear', 'Ease In': 'ease-in', 'Ease Out': 'ease-out' } }).on('change', (ev) => {
    if (getState().distribution.mode === 'path') {
      const d = getState().distribution as Extract<Distribution, { mode: 'path' }>;
      update({ distribution: { ...d, spacing: ev.value } as Distribution });
    }
  });

  const unsub = subscribe(() => {
    // reflect external changes if needed
  });
  return () => { unsub(); pane.dispose(); };
}
```

## State Management Architecture
State Structure
```ts
// apps/web/src/store/store.ts
import type { Scene } from "@shared/types";

let scene: Scene;
const listeners = new Set<(s: Scene) => void>();

export function init(initial: Scene) {
  scene = initial;
}

export function getState(): Scene {
  return scene;
}

export function update(patch: Partial<Scene>) {
  scene = { ...scene, ...patch };
  listeners.forEach((l) => l(scene));
}

export function subscribe(l: (s: Scene) => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
```

State Management Patterns
- Single source of truth (Scene) with pure selectors for derived data
- Immutable updates via shallow merges; avoid in-place mutation
- Evented subscriptions for rendering and side effects
- Deterministic RNG seeded in Scene; derive per-frame RNG streams from master seed
- Optional undo stack for UX polish (stretch)

## Routing Architecture
Route Organization
```text
apps/web/
  src/
    main.ts   # single-view SPA; optional hash routes later
```

Protected Route Pattern
```ts
// N/A in MVP (no auth). Example stub for future use:
export function requireAuth<T extends (...args: any[]) => any>(fn: T): T {
  return (((...args: any[]) => {
    // if (!isAuthenticated()) redirectToLogin(); else fn(...args)
    return fn(...args);
  }) as unknown) as T;
}
```

## Frontend Services Layer
API Client Setup
```ts
// apps/web/src/services/apiClient.ts
// MVP client-only; placeholder for future server calls
export async function get<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, method: "GET" });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return (await res.json()) as T;
}
```

Service Example
```ts
// apps/web/src/services/presets.ts
import type { Preset } from "@shared/types";

const KEY = "vtool.presets";

export function list(): Preset[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function save(preset: Preset) {
  const all = list();
  const idx = all.findIndex((p) => p.id === preset.id);
  if (idx >= 0) all[idx] = preset; else all.push(preset);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function load(id: string): Preset | null {
  return list().find((p) => p.id === id) || null;
}
```

Tweakpane Integration Notes
- Use a single Pane per panel to organize folders by feature (Object, Distribution, Transform, Styling, Viewport, Export, Presets).
- Bindings should update central state through `update(patch)` only; never mutate state objects directly.
- For performance, debounce rapid slider updates when they cause heavy instance re-sampling, or apply rAF batching in the renderer.
