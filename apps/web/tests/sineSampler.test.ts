import { describe, it, expect } from 'vitest';
import { sampleSinePath } from '../src/components/engine/sineSampler';
import type { PathDistribution } from '@v-tool/shared';

describe('Sine Sampler', () => {
  it('produces oscillating y positions', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: {
        type: 'sine',
        instances: 10,
        frequency: 1.0,
        amplitude: 50,
      },
      spacing: 'linear',
    };

    const instances = sampleSinePath(dist);

    expect(instances).toHaveLength(10);
    // First instance should be near center (y ≈ 0 due to sin(0) = 0)
    expect(Math.abs(instances[0].y)).toBeLessThan(5);
    // Check oscillation exists by finding instances with y != 0
    const nonZeroY = instances.filter((inst) => Math.abs(inst.y) > 1);
    expect(nonZeroY.length).toBeGreaterThan(0);
    // Should span roughly ±50 pixels
    const range = Math.max(...instances.map((i) => i.y)) - Math.min(...instances.map((i) => i.y));
    expect(range).toBeGreaterThan(80);
  });

  it('increases wave density with higher frequency', () => {
    const dist1: PathDistribution = {
      mode: 'path',
      path: { type: 'sine', instances: 20, frequency: 1.0, amplitude: 50 },
      spacing: 'linear',
    };

    const dist2: PathDistribution = {
      mode: 'path',
      path: { type: 'sine', instances: 20, frequency: 2.0, amplitude: 50 },
      spacing: 'linear',
    };

    const instances1 = sampleSinePath(dist1);
    const instances2 = sampleSinePath(dist2);

    // Higher frequency should have more oscillations
    // Check sign changes: frequency=2 should have more
    const getSignChanges = (insts: typeof instances1) => {
      let changes = 0;
      for (let i = 1; i < insts.length; i++) {
        if (Math.sign(insts[i].y) !== Math.sign(insts[i - 1].y)) {
          changes++;
        }
      }
      return changes;
    };

    const changes1 = getSignChanges(instances1);
    const changes2 = getSignChanges(instances2);

    expect(changes2).toBeGreaterThan(changes1);
  });

  it('increases wave height with higher amplitude', () => {
    const dist1: PathDistribution = {
      mode: 'path',
      path: { type: 'sine', instances: 10, frequency: 1.0, amplitude: 10 },
      spacing: 'linear',
    };

    const dist2: PathDistribution = {
      mode: 'path',
      path: { type: 'sine', instances: 10, frequency: 1.0, amplitude: 100 },
      spacing: 'linear',
    };

    const instances1 = sampleSinePath(dist1);
    const instances2 = sampleSinePath(dist2);

    // Higher amplitude should have larger y variations
    const range1 =
      Math.max(...instances1.map((i) => i.y)) - Math.min(...instances1.map((i) => i.y));
    const range2 =
      Math.max(...instances2.map((i) => i.y)) - Math.min(...instances2.map((i) => i.y));

    expect(range2).toBeGreaterThan(range1);
  });

  it('is deterministic (same inputs produce same outputs)', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: { type: 'sine', instances: 20, frequency: 1.5, amplitude: 75 },
      spacing: 'linear',
    };

    const result1 = sampleSinePath(dist);
    const result2 = sampleSinePath(dist);

    expect(result1).toEqual(result2);
  });

  it('handles frequency=0 edge case', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: { type: 'sine', instances: 10, frequency: 0, amplitude: 50 },
      spacing: 'linear',
    };

    const instances = sampleSinePath(dist);

    expect(instances).toHaveLength(10);
    // All y values should be approximately 0 (flat line)
    instances.forEach((inst) => {
      expect(Math.abs(inst.y)).toBeLessThan(1);
    });
  });

  it('handles amplitude=0 edge case', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: { type: 'sine', instances: 10, frequency: 1.0, amplitude: 0 },
      spacing: 'linear',
    };

    const instances = sampleSinePath(dist);

    expect(instances).toHaveLength(10);
    // All y values should be 0 (flat line)
    instances.forEach((inst) => {
      expect(inst.y).toBe(0);
    });
  });

  it('uses default frequency and amplitude when not specified', () => {
    const dist: PathDistribution = {
      mode: 'path',
      path: { type: 'sine', instances: 10 },
      spacing: 'linear',
    };

    const instances = sampleSinePath(dist);

    expect(instances).toHaveLength(10);
    // Should produce sine wave with defaults (frequency=1.0, amplitude=50)
    const range = Math.max(...instances.map((i) => i.y)) - Math.min(...instances.map((i) => i.y));
    expect(range).toBeGreaterThan(80); // Should span roughly ±50
  });
});

