import { describe, it, expect } from 'vitest';
import { seedRNG, randomBetween } from '../src/utils/rng';

describe('RNG', () => {
  it('produces same sequence for same seed', () => {
    const rng1 = seedRNG(12345);
    const rng2 = seedRNG(12345);

    expect(rng1()).toBe(rng2());
    expect(rng1()).toBe(rng2());
    expect(rng1()).toBe(rng2());
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = seedRNG(12345);
    const rng2 = seedRNG(54321);

    expect(rng1()).not.toBe(rng2());
  });

  it('returns values in 0-1 range', () => {
    const rng = seedRNG(12345);

    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('randomBetween generates values in specified range', () => {
    const rng = seedRNG(12345);

    for (let i = 0; i < 100; i++) {
      const value = randomBetween(10, 20, rng);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThan(20);
    }
  });

  it('randomBetween is deterministic with same seed', () => {
    const rng1 = seedRNG(12345);
    const rng2 = seedRNG(12345);

    expect(randomBetween(0, 100, rng1)).toBe(randomBetween(0, 100, rng2));
    expect(randomBetween(0, 100, rng1)).toBe(randomBetween(0, 100, rng2));
  });
});

