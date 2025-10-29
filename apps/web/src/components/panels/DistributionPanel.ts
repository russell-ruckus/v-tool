/**
 * DistributionPanel component - instance count and spacing controls
 */
import { Pane } from 'tweakpane';
import { getState, update, subscribe } from '../../store/store';
import type { Distribution, SpacingFn } from '@v-tool/shared';

export function DistributionPanel(root: HTMLElement) {
  const pane = new Pane({
    container: root,
    title: 'Distribution',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any; // Type workaround for Tweakpane 4.x

  const state = getState();

  const d = state.distribution as Extract<Distribution, { mode: 'path' }>;

  const params = {
    instances: d.path.instances,
    spacing: d.spacing,
  } as { instances: number; spacing: SpacingFn };

  // Instances count input
  pane
    .addBinding(params, 'instances', {
      min: 0,
      max: 2000,
      step: 1,
      label: 'Instances',
    })
    .on('change', (ev: { value: number }) => {
      update({
        distribution: {
          ...d,
          path: { ...d.path, instances: Math.max(0, Math.floor(ev.value)) },
        } as Distribution,
      });
    });

  // Spacing function dropdown
  pane
    .addBlade({
      view: 'list',
      label: 'Spacing',
      options: [
        { text: 'Linear', value: 'linear' },
        { text: 'Ease In', value: 'ease-in' },
        { text: 'Ease Out', value: 'ease-out' },
      ],
      value: params.spacing,
    })
    .on('change', (ev: { value: SpacingFn }) => {
      update({
        distribution: {
          ...d,
          spacing: ev.value,
        } as Distribution,
      });
    });

  // Subscribe to external state changes
  const unsub = subscribe((scene) => {
    if (scene.distribution.mode === 'path') {
      const newD = scene.distribution as Extract<Distribution, { mode: 'path' }>;
      if (newD.path.instances !== params.instances || newD.spacing !== params.spacing) {
        params.instances = newD.path.instances;
        params.spacing = newD.spacing;
        pane.refresh();
      }
    }
  });

  // Return cleanup function
  return () => {
    unsub();
    pane.dispose();
  };
}

