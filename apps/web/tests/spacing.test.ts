import { describe, it, expect } from 'vitest';
import { applySpacing } from '../src/utils/spacing';

describe('Spacing Functions', () => {
  it('linear spacing produces no change', () => {
    const positions = [
      { x: -300, y: 0 },
      { x: 0, y: 0 },
      { x: 300, y: 0 },
    ];

    const result = applySpacing(positions, 'linear');

    expect(result[0].x).toBe(-300);
    expect(result[1].x).toBe(0);
    expect(result[2].x).toBe(300);
  });

  it('ease-in concentrates instances at start', () => {
    const positions = [
      { x: -300, y: 0 },
      { x: 0, y: 0 },
      { x: 300, y: 0 },
    ];

    const result = applySpacing(positions, 'ease-in');

    // First position should be unchanged
    expect(result[0].x).toBe(-300);
    // Last position should be unchanged
    expect(result[2].x).toBe(300);
    // Middle position should be shifted left (closer to start)
    expect(result[1].x).toBeLessThan(0);
  });

  it('ease-out concentrates instances at end', () => {
    const positions = [
      { x: -300, y: 0 },
      { x: 0, y: 0 },
      { x: 300, y: 0 },
    ];

    const result = applySpacing(positions, 'ease-out');

    // First position should be unchanged
    expect(result[0].x).toBe(-300);
    // Last position should be unchanged
    expect(result[2].x).toBe(300);
    // Middle position should be shifted right (closer to end)
    expect(result[1].x).toBeGreaterThan(0);
  });

  it('maintains y position', () => {
    const positions = [
      { x: -300, y: 100 },
      { x: 0, y: 200 },
      { x: 300, y: 300 },
    ];

    const result = applySpacing(positions, 'ease-in');

    expect(result[0].y).toBe(100);
    expect(result[1].y).toBe(200);
    expect(result[2].y).toBe(300);
  });

  it('is pure function (no side effects)', () => {
    const positions = [
      { x: -300, y: 0 },
      { x: 0, y: 0 },
      { x: 300, y: 0 },
    ];

    const original = JSON.parse(JSON.stringify(positions));
    applySpacing(positions, 'ease-in');

    expect(positions).toEqual(original);
  });

  it('handles single position', () => {
    const positions = [{ x: 0, y: 0 }];

    const result = applySpacing(positions, 'ease-in');

    expect(result).toHaveLength(1);
    expect(result[0].x).toBe(0);
  });

  it('handles two positions', () => {
    const positions = [
      { x: -300, y: 0 },
      { x: 300, y: 0 },
    ];

    const result = applySpacing(positions, 'ease-in');

    expect(result).toHaveLength(2);
    expect(result[0].x).toBe(-300);
    expect(result[1].x).toBe(300);
  });
});

