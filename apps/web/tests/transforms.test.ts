/**
 * Transform utilities unit tests
 * Tests depth→scale mapping, rotation, and sorting functionality
 */
import { describe, it, expect } from 'vitest';
import { applyDepthToScale, applyRotation, sortByDepth } from '../src/utils/transforms';
import type { Instance, Transform } from '@v-tool/shared';

describe('Transform Utilities', () => {
  describe('applyDepthToScale', () => {
    it('maps depth to scale correctly', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0 },
        { x: 0, y: 0, rotation: 0, depth: 0.5 },
        { x: 0, y: 0, rotation: 0, depth: 1 },
      ];
      
      const transform: Transform = {
        depthRange: [0, 1],
        scaleRange: [0.5, 1.5],
        rotation: { mode: 'fixed', value: 0 },
        sortByDepth: false,
      };
      
      const result = applyDepthToScale(instances, transform);
      
      expect(result[0].scale).toBeCloseTo(0.5);
      expect(result[1].scale).toBeCloseTo(1.0);
      expect(result[2].scale).toBeCloseTo(1.5);
    });

    it('handles custom depth range', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0.2 },
        { x: 0, y: 0, rotation: 0, depth: 0.6 },
        { x: 0, y: 0, rotation: 0, depth: 1.0 },
      ];
      
      const transform: Transform = {
        depthRange: [0.2, 1.0],
        scaleRange: [0.8, 1.2],
        rotation: { mode: 'fixed', value: 0 },
        sortByDepth: false,
      };
      
      const result = applyDepthToScale(instances, transform);
      
      expect(result[0].scale).toBeCloseTo(0.8); // depth=0.2 maps to min scale
      expect(result[1].scale).toBeCloseTo(1.0); // depth=0.6 maps to middle
      expect(result[2].scale).toBeCloseTo(1.2); // depth=1.0 maps to max scale
    });

    it('clamps depth values outside range', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: -0.5 }, // below range
        { x: 0, y: 0, rotation: 0, depth: 1.5 },  // above range
      ];
      
      const transform: Transform = {
        depthRange: [0, 1],
        scaleRange: [0.5, 1.5],
        rotation: { mode: 'fixed', value: 0 },
        sortByDepth: false,
      };
      
      const result = applyDepthToScale(instances, transform);
      
      expect(result[0].scale).toBeCloseTo(0.5); // clamped to min
      expect(result[1].scale).toBeCloseTo(1.5); // clamped to max
    });

    it('handles edge case: same depth range values', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0.5 },
      ];
      
      const transform: Transform = {
        depthRange: [0.5, 0.5], // same min/max
        scaleRange: [1.0, 2.0],
        rotation: { mode: 'fixed', value: 0 },
        sortByDepth: false,
      };
      
      const result = applyDepthToScale(instances, transform);
      
      expect(result[0].scale).toBeCloseTo(1.0); // should use min scale
    });

    it('handles edge case: same scale range values', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0 },
        { x: 0, y: 0, rotation: 0, depth: 1 },
      ];
      
      const transform: Transform = {
        depthRange: [0, 1],
        scaleRange: [1.0, 1.0], // same min/max
        rotation: { mode: 'fixed', value: 0 },
        sortByDepth: false,
      };
      
      const result = applyDepthToScale(instances, transform);
      
      expect(result[0].scale).toBeCloseTo(1.0);
      expect(result[1].scale).toBeCloseTo(1.0);
    });
  });

  describe('applyRotation', () => {
    it('applies fixed rotation to all instances', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0 },
        { x: 0, y: 0, rotation: 0, depth: 0.5 },
      ];
      
      const transform: Transform = {
        depthRange: [0, 1],
        scaleRange: [1, 1],
        rotation: { mode: 'fixed', value: 45 },
        sortByDepth: false,
      };
      
      const result = applyRotation(instances, transform, 12345);
      
      expect(result[0].rotation).toBe(45);
      expect(result[1].rotation).toBe(45);
    });

    it('applies random rotation within range', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0 },
        { x: 0, y: 0, rotation: 0, depth: 0.5 },
      ];
      
      const transform: Transform = {
        depthRange: [0, 1],
        scaleRange: [1, 1],
        rotation: { mode: 'range', min: 0, max: 90 },
        sortByDepth: false,
      };
      
      const result = applyRotation(instances, transform, 12345);
      
      expect(result[0].rotation).toBeGreaterThanOrEqual(0);
      expect(result[0].rotation).toBeLessThanOrEqual(90);
      expect(result[1].rotation).toBeGreaterThanOrEqual(0);
      expect(result[1].rotation).toBeLessThanOrEqual(90);
    });

    it('is deterministic with same seed', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0 },
        { x: 0, y: 0, rotation: 0, depth: 0.5 },
      ];
      
      const transform: Transform = {
        depthRange: [0, 1],
        scaleRange: [1, 1],
        rotation: { mode: 'range', min: 0, max: 360 },
        sortByDepth: false,
      };
      
      const result1 = applyRotation(instances, transform, 12345);
      const result2 = applyRotation(instances, transform, 12345);
      
      expect(result1).toEqual(result2);
    });

    it('produces different results with different seeds', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0 },
        { x: 0, y: 0, rotation: 0, depth: 0.5 },
      ];
      
      const transform: Transform = {
        depthRange: [0, 1],
        scaleRange: [1, 1],
        rotation: { mode: 'range', min: 0, max: 360 },
        sortByDepth: false,
      };
      
      const result1 = applyRotation(instances, transform, 12345);
      const result2 = applyRotation(instances, transform, 54321);
      
      // Should be different (very unlikely to be the same)
      expect(result1).not.toEqual(result2);
    });

    it('handles missing rotation values with defaults', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0 },
      ];
      
      const transform: Transform = {
        depthRange: [0, 1],
        scaleRange: [1, 1],
        rotation: { mode: 'fixed' }, // no value specified
        sortByDepth: false,
      };
      
      const result = applyRotation(instances, transform, 12345);
      
      expect(result[0].rotation).toBe(0); // should default to 0
    });

    it('handles missing range values with defaults', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0 },
      ];
      
      const transform: Transform = {
        depthRange: [0, 1],
        scaleRange: [1, 1],
        rotation: { mode: 'range' }, // no min/max specified
        sortByDepth: false,
      };
      
      const result = applyRotation(instances, transform, 12345);
      
      expect(result[0].rotation).toBeGreaterThanOrEqual(0);
      expect(result[0].rotation).toBeLessThanOrEqual(360);
    });
  });

  describe('sortByDepth', () => {
    it('sorts instances by depth ascending', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0.8 },
        { x: 0, y: 0, rotation: 0, depth: 0.2 },
        { x: 0, y: 0, rotation: 0, depth: 0.5 },
      ];
      
      const result = sortByDepth(instances);
      
      expect(result[0].depth).toBe(0.2);
      expect(result[1].depth).toBe(0.5);
      expect(result[2].depth).toBe(0.8);
    });

    it('preserves original array (creates shallow copy)', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0.8 },
        { x: 0, y: 0, rotation: 0, depth: 0.2 },
      ];
      
      const result = sortByDepth(instances);
      
      // Original array should be unchanged
      expect(instances[0].depth).toBe(0.8);
      expect(instances[1].depth).toBe(0.2);
      
      // Result should be sorted
      expect(result[0].depth).toBe(0.2);
      expect(result[1].depth).toBe(0.8);
      
      // Should be different array references
      expect(result).not.toBe(instances);
    });

    it('handles empty array', () => {
      const instances: Instance[] = [];
      
      const result = sortByDepth(instances);
      
      expect(result).toEqual([]);
    });

    it('handles single instance', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0.5 },
      ];
      
      const result = sortByDepth(instances);
      
      expect(result).toEqual(instances);
      expect(result).not.toBe(instances); // should still be a copy
    });

    it('handles instances with same depth', () => {
      const instances: Instance[] = [
        { x: 1, y: 1, rotation: 0, depth: 0.5 },
        { x: 2, y: 2, rotation: 0, depth: 0.5 },
        { x: 3, y: 3, rotation: 0, depth: 0.5 },
      ];
      
      const result = sortByDepth(instances);
      
      // Should maintain original order for equal depths
      expect(result[0].x).toBe(1);
      expect(result[1].x).toBe(2);
      expect(result[2].x).toBe(3);
    });
  });

  describe('integration tests', () => {
    it('applies all transforms in correct order', () => {
      const instances: Instance[] = [
        { x: 0, y: 0, rotation: 0, depth: 0.2 },
        { x: 0, y: 0, rotation: 0, depth: 0.8 },
      ];
      
      const transform: Transform = {
        depthRange: [0, 1],
        scaleRange: [0.5, 1.5],
        rotation: { mode: 'fixed', value: 45 },
        sortByDepth: true,
      };
      
      // Apply transforms in the same order as Renderer
      let result = applyDepthToScale(instances, transform);
      result = applyRotation(result, transform, 12345);
      result = sortByDepth(result);
      
      // Should be sorted by depth (0.2 first, then 0.8)
      expect(result[0].depth).toBe(0.2);
      expect(result[1].depth).toBe(0.8);
      
      // Should have correct scales
      expect(result[0].scale).toBeCloseTo(0.7); // depth 0.2 → scale 0.7
      expect(result[1].scale).toBeCloseTo(1.3); // depth 0.8 → scale 1.3
      
      // Should have fixed rotation
      expect(result[0].rotation).toBe(45);
      expect(result[1].rotation).toBe(45);
    });
  });
});
