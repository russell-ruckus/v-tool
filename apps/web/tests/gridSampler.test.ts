/**
 * Grid sampler tests
 * Verifies grid jitter functionality and deterministic behavior
 */
import { describe, it, expect } from 'vitest';
import { sampleGridJitter } from '../src/components/engine/gridSampler';
import type { GridJitter } from '@v-tool/shared';

describe('Grid Sampler', () => {
  it('produces structured grid layout with zero jitter', () => {
    const grid: GridJitter = { type: 'grid', density: 20, jitter: 0 };
    const instances = sampleGridJitter(grid, 12345);
    
    // Should produce approximately density * 48 instances (800*600/10000 = 48)
    expect(instances.length).toBeGreaterThan(900);
    expect(instances.length).toBeLessThan(1000);
    
    // With zero jitter, positions should be evenly spaced
    const xPositions = instances.map(i => i.x).sort((a, b) => a - b);
    const yPositions = instances.map(i => i.y).sort((a, b) => a - b);
    
    // Check that positions are within canvas bounds
    expect(Math.min(...xPositions)).toBeGreaterThanOrEqual(-400);
    expect(Math.max(...xPositions)).toBeLessThanOrEqual(400);
    expect(Math.min(...yPositions)).toBeGreaterThanOrEqual(-300);
    expect(Math.max(...yPositions)).toBeLessThanOrEqual(300);
  });

  it('density affects instance count', () => {
    const grid10: GridJitter = { type: 'grid', density: 10, jitter: 0 };
    const grid30: GridJitter = { type: 'grid', density: 30, jitter: 0 };
    
    const instances10 = sampleGridJitter(grid10, 12345);
    const instances30 = sampleGridJitter(grid30, 12345);
    
    // Higher density should produce more instances
    expect(instances30.length).toBeGreaterThan(instances10.length);
    
    // Approximately 3x more instances for 3x density
    expect(instances30.length / instances10.length).toBeCloseTo(3, 0.5);
  });

  it('jitter increases position variance', () => {
    const grid0: GridJitter = { type: 'grid', density: 20, jitter: 0 };
    const grid1: GridJitter = { type: 'grid', density: 20, jitter: 1.0 };
    
    const instances0 = sampleGridJitter(grid0, 12345);
    const instances1 = sampleGridJitter(grid1, 12345);
    
    // Same number of instances
    expect(instances1.length).toBe(instances0.length);
    
    // With jitter=0, all instances should be on perfect grid
    // With jitter=1.0, instances should be more spread out
    
    // Calculate range (max - min) instead of variance for more reliable test
    const xPositions0 = instances0.map(i => i.x);
    const xPositions1 = instances1.map(i => i.x);
    const yPositions0 = instances0.map(i => i.y);
    const yPositions1 = instances1.map(i => i.y);
    
    const xRange0 = Math.max(...xPositions0) - Math.min(...xPositions0);
    const xRange1 = Math.max(...xPositions1) - Math.min(...xPositions1);
    const yRange0 = Math.max(...yPositions0) - Math.min(...yPositions0);
    const yRange1 = Math.max(...yPositions1) - Math.min(...yPositions1);
    
    // Higher jitter should increase the range of positions
    expect(xRange1).toBeGreaterThan(xRange0);
    expect(yRange1).toBeGreaterThan(yRange0);
  });

  it('is deterministic (same seed produces same output)', () => {
    const grid: GridJitter = { type: 'grid', density: 20, jitter: 0.5 };
    
    const result1 = sampleGridJitter(grid, 12345);
    const result2 = sampleGridJitter(grid, 12345);
    
    expect(result1).toEqual(result2);
  });

  it('different seeds produce different outputs with jitter', () => {
    const grid: GridJitter = { type: 'grid', density: 20, jitter: 0.5 };
    
    const result1 = sampleGridJitter(grid, 12345);
    const result2 = sampleGridJitter(grid, 54321);
    
    // Same number of instances
    expect(result1.length).toBe(result2.length);
    
    // But different positions due to different jitter
    expect(result1).not.toEqual(result2);
  });

  it('handles edge case: density = 0', () => {
    const grid: GridJitter = { type: 'grid', density: 0, jitter: 0.5 };
    const instances = sampleGridJitter(grid, 12345);
    
    expect(instances).toEqual([]);
  });

  it('handles edge case: density = 1', () => {
    const grid: GridJitter = { type: 'grid', density: 1, jitter: 0.5 };
    const instances = sampleGridJitter(grid, 12345);
    
    // Should produce approximately 48 instances
    expect(instances.length).toBeGreaterThan(40);
    expect(instances.length).toBeLessThan(60);
  });

  it('handles edge case: jitter = 0 (perfect grid)', () => {
    const grid: GridJitter = { type: 'grid', density: 10, jitter: 0 };
    const instances = sampleGridJitter(grid, 12345);
    
    // All instances should have rotation = 0
    instances.forEach(inst => {
      expect(inst.rotation).toBe(0);
    });
    
    // Positions should be evenly distributed
    const xPositions = instances.map(i => i.x).sort((a, b) => a - b);
    const yPositions = instances.map(i => i.y).sort((a, b) => a - b);
    
    // Check for regular spacing (approximate due to grid calculation)
    if (xPositions.length > 1) {
      const avgXSpacing = (xPositions[xPositions.length - 1] - xPositions[0]) / (xPositions.length - 1);
      expect(avgXSpacing).toBeGreaterThan(0);
    }
    if (yPositions.length > 1) {
      const avgYSpacing = (yPositions[yPositions.length - 1] - yPositions[0]) / (yPositions.length - 1);
      expect(avgYSpacing).toBeGreaterThan(0);
    }
  });

  it('handles edge case: jitter = 1 (maximum jitter)', () => {
    const grid: GridJitter = { type: 'grid', density: 20, jitter: 1.0 };
    const instances = sampleGridJitter(grid, 12345);
    
    // Should still produce expected number of instances
    expect(instances.length).toBeGreaterThan(900);
    
    // All positions should still be within canvas bounds
    instances.forEach(inst => {
      expect(inst.x).toBeGreaterThanOrEqual(-400);
      expect(inst.x).toBeLessThanOrEqual(400);
      expect(inst.y).toBeGreaterThanOrEqual(-300);
      expect(inst.y).toBeLessThanOrEqual(300);
    });
  });

  it('produces instances with correct structure', () => {
    const grid: GridJitter = { type: 'grid', density: 10, jitter: 0.3 };
    const instances = sampleGridJitter(grid, 12345);
    
    instances.forEach(inst => {
      expect(inst).toHaveProperty('x');
      expect(inst).toHaveProperty('y');
      expect(inst).toHaveProperty('rotation');
      expect(typeof inst.x).toBe('number');
      expect(typeof inst.y).toBe('number');
      expect(typeof inst.rotation).toBe('number');
      expect(inst.rotation).toBe(0); // Grid sampler always sets rotation to 0
    });
  });
});
