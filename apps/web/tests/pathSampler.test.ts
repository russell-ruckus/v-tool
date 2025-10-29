import { describe, it, expect } from 'vitest';
import { sampleLinearPath } from '../src/components/engine/pathSampler';
import type { PathDistribution } from '@v-tool/shared';

describe('Path Sampler', () => {
  it('places 5 instances evenly along line', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: { type: 'linear', instances: 5 },
      spacing: 'linear',
    };

    const instances = sampleLinearPath(dist);

    expect(instances).toHaveLength(5);
    expect(instances[0].x).toBe(-300); // start
    expect(instances[4].x).toBe(300); // end
    expect(instances[2].x).toBeCloseTo(0); // middle
  });

  it('places 10 instances evenly along line', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: { type: 'linear', instances: 10 },
      spacing: 'linear',
    };

    const instances = sampleLinearPath(dist);

    expect(instances).toHaveLength(10);
    expect(instances[0].x).toBe(-300);
    expect(instances[9].x).toBe(300);
  });

  it('is deterministic (same input produces same output)', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: { type: 'linear', instances: 10 },
      spacing: 'linear',
    };

    const result1 = sampleLinearPath(dist);
    const result2 = sampleLinearPath(dist);

    expect(result1).toEqual(result2);
  });

  it('handles N=0 edge case', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: { type: 'linear', instances: 0 },
      spacing: 'linear',
    };

    const instances = sampleLinearPath(dist);

    expect(instances).toHaveLength(0);
  });

  it('handles N=1 edge case', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: { type: 'linear', instances: 1 },
      spacing: 'linear',
    };

    const instances = sampleLinearPath(dist);

    expect(instances).toHaveLength(1);
    expect(instances[0].x).toBe(0); // midpoint
    expect(instances[0].y).toBe(0);
  });

  it('handles N=2 edge case', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: { type: 'linear', instances: 2 },
      spacing: 'linear',
    };

    const instances = sampleLinearPath(dist);

    expect(instances).toHaveLength(2);
    expect(instances[0].x).toBe(-300);
    expect(instances[1].x).toBe(300);
  });

  it('generates large number of instances', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: { type: 'linear', instances: 100 },
      spacing: 'linear',
    };

    const instances = sampleLinearPath(dist);

    expect(instances).toHaveLength(100);
    expect(instances[0].x).toBe(-300);
    expect(instances[99].x).toBe(300);
  });
});

