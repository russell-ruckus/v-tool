# Testing Strategy

Test Pyramid
```text
          E2E Tests
         /        \
    Integration   Component/Unit
```

Test Organization
```text
apps/web/
  tests/            # component tests (Vitest + Testing Library)
  e2e/              # Playwright tests
packages/engine/
  tests/            # pure function/unit tests
```

Frontend Component Test (example)
```ts
import { describe, it, expect } from 'vitest';
import { DistributionPanel } from '../src/components/panels/DistributionPanel';

describe('DistributionPanel', () => {
  it('updates instances without negative values', () => {
    const root = document.createElement('div');
    root.innerHTML = '<input id="instances" />';
    DistributionPanel(root);
    const input = root.querySelector('#instances') as HTMLInputElement;
    input.value = '-5';
    input.dispatchEvent(new Event('input'));
    expect(Number(input.value)).toBe(0);
  });
});
```

Engine Unit Test (example)
```ts
import { describe, it, expect } from 'vitest';
import { samplePath } from '../src/engine';
import type { Scene } from '@shared/types';

it('produces deterministic instances for same seed', () => {
  const s1: Scene = /* ... */ {} as any;
  const s2: Scene = /* same values with same seed */ {} as any;
  expect(samplePath(s1)).toEqual(samplePath(s2));
});
```

E2E Test (export parity smoke)
```ts
import { test, expect } from '@playwright/test';
test('export matches preview size and structure', async ({ page }) => {
  await page.goto('/');
  // tweak params
  await page.getByLabel('Instances').fill('100');
  // trigger export and compare basic invariants
  const svgText = await page.evaluate(() => window.__debugExport());
  expect(svgText).toContain('<clipPath');
  expect(svgText).toContain('<symbol');
});
```
