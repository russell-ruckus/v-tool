/**
 * ObjectPanel component - shape selection controls
 */
import { Pane } from 'tweakpane';
import { getState, update, subscribe } from '../../store/store';
import type { BasicShape } from '@v-tool/shared';

export function ObjectPanel(root: HTMLElement) {
  const pane = new Pane({
    container: root,
    title: 'Object',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any; // Type workaround for Tweakpane 4.x

  const state = getState();

  // Initialize params from current state
  const params = {
    shape: (state.shape.type === 'basic' ? state.shape.shape : 'square') as BasicShape,
  };

  // Shape selection dropdown
  pane
    .addBlade({
      view: 'list',
      label: 'Shape',
      options: [
        { text: 'Square', value: 'square' },
        { text: 'Circle', value: 'circle' },
        { text: 'Triangle', value: 'triangle' },
      ],
      value: params.shape,
    })
    .on('change', (ev: { value: BasicShape }) => {
      update({ shape: { type: 'basic', shape: ev.value } });
    });

  // Subscribe to external state changes (if needed)
  const unsub = subscribe((scene) => {
    if (scene.shape.type === 'basic' && scene.shape.shape !== params.shape) {
      params.shape = scene.shape.shape;
      pane.refresh();
    }
  });

  // Return cleanup function
  return () => {
    unsub();
    pane.dispose();
  };
}

