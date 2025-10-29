import { describe, it, expect, beforeEach } from 'vitest';
import { init, getState, update, subscribe } from '../src/store/store';
import { createTestScene } from './testHelpers';
import type { Scene } from '@v-tool/shared';

describe('Store', () => {
  const defaultScene = createTestScene();

  beforeEach(() => {
    init(defaultScene);
  });

  it('initializes with scene', () => {
    const state = getState();
    expect(state.id).toBe('1');
    expect(state.version).toBe('1.0');
    expect(state.shape.type).toBe('basic');
    if (state.shape.type === 'basic') {
      expect(state.shape.shape).toBe('square');
    }
  });

  it('returns current state', () => {
    const state = getState();
    expect(state).toEqual(defaultScene);
  });

  it('updates scene with partial patch', () => {
    update({ shape: { type: 'basic', shape: 'circle' } });

    const state = getState();
    expect(state.id).toBe('1'); // Unchanged
    expect(state.version).toBe('1.0'); // Unchanged
    if (state.shape.type === 'basic') {
      expect(state.shape.shape).toBe('circle'); // Updated
    }
  });

  it('notifies subscribers on update', () => {
    let notified = false;
    let receivedScene: Scene | undefined;

    const unsub = subscribe((scene) => {
      notified = true;
      receivedScene = scene;
    });

    update({ shape: { type: 'basic', shape: 'triangle' } });

    expect(notified).toBe(true);
    expect(receivedScene).toBeDefined();
    if (receivedScene?.shape.type === 'basic') {
      expect(receivedScene.shape.shape).toBe('triangle');
    }

    unsub();
  });

  it('unsubscribes correctly', () => {
    let callCount = 0;

    const unsub = subscribe(() => {
      callCount++;
    });

    update({ shape: { type: 'basic', shape: 'circle' } });
    expect(callCount).toBe(1);

    unsub();

    update({ shape: { type: 'basic', shape: 'triangle' } });
    expect(callCount).toBe(1); // Should not increment after unsubscribe
  });

  it('supports multiple subscribers', () => {
    let count1 = 0;
    let count2 = 0;

    const unsub1 = subscribe(() => {
      count1++;
    });
    const unsub2 = subscribe(() => {
      count2++;
    });

    update({ shape: { type: 'basic', shape: 'circle' } });

    expect(count1).toBe(1);
    expect(count2).toBe(1);

    unsub1();
    unsub2();
  });

  it('preserves immutability', () => {
    const initialState = getState();
    update({ shape: { type: 'basic', shape: 'circle' } });
    const updatedState = getState();

    expect(initialState).not.toBe(updatedState); // Different object references
    if (initialState.shape.type === 'basic' && updatedState.shape.type === 'basic') {
      expect(initialState.shape.shape).not.toBe(updatedState.shape.shape);
    }
  });
});

