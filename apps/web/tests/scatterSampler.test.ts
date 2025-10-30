/**
 * Random scatter sampler tests
 * Verifies random scatter functionality and deterministic behavior
 */
import { describe, it, expect } from 'vitest';
import { sampleRandomScatter } from '../src/components/engine/scatterSampler';
import type { RandomScatter } from '@v-tool/shared';

describe('Random Scatter Sampler', () => {
  it('produces random positions', () => {
    const scatter: RandomScatter = { type: 'random', density: 20 };
    const instances = sampleRandomScatter(scatter, 12345);
    
    // Should produce approximately density * 48 instances (800*600/10000 = 48)
    expect(instances.length).toBeGreaterThan(900);
    expect(instances.length).toBeLessThan(1000);
    
    // Verify randomness: positions should not be uniform
    const xPositions = instances.map(i => i.x);
    const yPositions = instances.map(i => i.y);
    const uniqueXPositions = new Set(xPositions);
    const uniqueYPositions = new Set(yPositions);
    
    // Should have high uniqueness (most positions different)
    expect(uniqueXPositions.size).toBeGreaterThan(instances.length * 0.9);
    expect(uniqueYPositions.size).toBeGreaterThan(instances.length * 0.9);
  });

  it('respects canvas bounds', () => {
    const scatter: RandomScatter = { type: 'random', density: 50 };
    const instances = sampleRandomScatter(scatter, 12345);
    
    instances.forEach(inst => {
      expect(inst.x).toBeGreaterThanOrEqual(-400);
      expect(inst.x).toBeLessThanOrEqual(400);
      expect(inst.y).toBeGreaterThanOrEqual(-300);
      expect(inst.y).toBeLessThanOrEqual(300);
    });
  });

  it('density affects instance count', () => {
    const scatter1: RandomScatter = { type: 'random', density: 10 };
    const scatter2: RandomScatter = { type: 'random', density: 50 };
    
    const instances1 = sampleRandomScatter(scatter1, 12345);
    const instances2 = sampleRandomScatter(scatter2, 12345);
    
    // Higher density should produce more instances
    expect(instances2.length).toBeGreaterThan(instances1.length);
    
    // Approximately 5x more instances for 5x density
    expect(instances2.length / instances1.length).toBeCloseTo(5, 1);
  });

  it('is deterministic (same seed produces same output)', () => {
    const scatter: RandomScatter = { type: 'random', density: 20 };
    
    const result1 = sampleRandomScatter(scatter, 12345);
    const result2 = sampleRandomScatter(scatter, 12345);
    
    expect(result1).toEqual(result2);
  });

  it('different seeds produce different outputs', () => {
    const scatter: RandomScatter = { type: 'random', density: 20 };
    
    const result1 = sampleRandomScatter(scatter, 12345);
    const result2 = sampleRandomScatter(scatter, 54321);
    
    // Same number of instances
    expect(result1.length).toBe(result2.length);
    
    // But different positions due to different randomness
    expect(result1).not.toEqual(result2);
  });

  it('handles edge case: density = 0', () => {
    const scatter: RandomScatter = { type: 'random', density: 0 };
    const instances = sampleRandomScatter(scatter, 12345);
    
    expect(instances).toEqual([]);
  });

  it('handles edge case: density = 1', () => {
    const scatter: RandomScatter = { type: 'random', density: 1 };
    const instances = sampleRandomScatter(scatter, 12345);
    
    // Should produce approximately 48 instances
    expect(instances.length).toBeGreaterThan(40);
    expect(instances.length).toBeLessThan(60);
  });

  it('handles edge case: density = 100 (high density)', () => {
    const scatter: RandomScatter = { type: 'random', density: 100 };
    const instances = sampleRandomScatter(scatter, 12345);
    
    // Should produce approximately 4800 instances
    expect(instances.length).toBeGreaterThan(4500);
    expect(instances.length).toBeLessThan(5000);
    
    // All positions should still be within bounds
    instances.forEach(inst => {
      expect(inst.x).toBeGreaterThanOrEqual(-400);
      expect(inst.x).toBeLessThanOrEqual(400);
      expect(inst.y).toBeGreaterThanOrEqual(-300);
      expect(inst.y).toBeLessThanOrEqual(300);
    });
  });

  it('produces instances with correct structure', () => {
    const scatter: RandomScatter = { type: 'random', density: 10 };
    const instances = sampleRandomScatter(scatter, 12345);
    
    instances.forEach(inst => {
      expect(inst).toHaveProperty('x');
      expect(inst).toHaveProperty('y');
      expect(inst).toHaveProperty('rotation');
      expect(typeof inst.x).toBe('number');
      expect(typeof inst.y).toBe('number');
      expect(typeof inst.rotation).toBe('number');
      expect(inst.rotation).toBe(0); // Scatter sampler always sets rotation to 0
    });
  });

  it('produces uniform distribution across canvas', () => {
    const scatter: RandomScatter = { type: 'random', density: 50 };
    const instances = sampleRandomScatter(scatter, 12345);
    
    // Divide canvas into quadrants and check distribution
    const quadrants = {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    };
    
    instances.forEach(inst => {
      if (inst.x <= 0 && inst.y <= 0) quadrants.topLeft++;
      else if (inst.x > 0 && inst.y <= 0) quadrants.topRight++;
      else if (inst.x <= 0 && inst.y > 0) quadrants.bottomLeft++;
      else quadrants.bottomRight++;
    });
    
    // Each quadrant should have roughly 1/4 of instances (allowing for randomness)
    const expectedPerQuadrant = instances.length / 4;
    const tolerance = expectedPerQuadrant * 0.3; // 30% tolerance
    
    expect(quadrants.topLeft).toBeGreaterThan(expectedPerQuadrant - tolerance);
    expect(quadrants.topLeft).toBeLessThan(expectedPerQuadrant + tolerance);
    expect(quadrants.topRight).toBeGreaterThan(expectedPerQuadrant - tolerance);
    expect(quadrants.topRight).toBeLessThan(expectedPerQuadrant + tolerance);
    expect(quadrants.bottomLeft).toBeGreaterThan(expectedPerQuadrant - tolerance);
    expect(quadrants.bottomLeft).toBeLessThan(expectedPerQuadrant + tolerance);
    expect(quadrants.bottomRight).toBeGreaterThan(expectedPerQuadrant - tolerance);
    expect(quadrants.bottomRight).toBeLessThan(expectedPerQuadrant + tolerance);
  });
});
