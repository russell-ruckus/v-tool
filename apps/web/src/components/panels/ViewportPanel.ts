/**
 * Viewport Panel UI
 * Controls aspect ratio, orientation, and width for export overlay
 */
import { Pane } from 'tweakpane';
import { getState, getViewport, subscribe, updateViewport } from '../../store/store';
import { computeViewportSize } from '../../utils/view';
import type { AspectRatio, Orientation } from '@v-tool/shared';

const ASPECT_OPTIONS = {
  '16:9': '16:9',
  '1:1': '1:1',
  '4:3': '4:3',
} as const;

const ORIENTATION_OPTIONS = {
  Landscape: 'landscape',
  Portrait: 'portrait',
} as const;

export function ViewportPanel(root: HTMLElement) {
  const pane = new Pane({
    container: root,
    title: 'Viewport',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

  const viewport = getViewport();
  const size = computeViewportSize(getState());

  const params = {
    aspect: viewport.aspect,
    orientation: viewport.orientation,
    width: viewport.width,
    height: Math.round(size.height),
  };

  const viewportFolder = pane.addFolder({ title: 'Overlay', expanded: true });

  viewportFolder
    .addBinding(params, 'aspect', {
      options: ASPECT_OPTIONS,
      label: 'Aspect',
    })
    .on('change', (ev: { value: AspectRatio }) => {
      updateViewport({ aspect: ev.value });
    });

  viewportFolder
    .addBinding(params, 'orientation', {
      options: ORIENTATION_OPTIONS,
      label: 'Orientation',
    })
    .on('change', (ev: { value: Orientation }) => {
      updateViewport({ orientation: ev.value });
    });

  viewportFolder
    .addBinding(params, 'width', {
      min: 200,
      max: 1600,
      step: 10,
      label: 'Width',
    })
    .on('change', (ev: { value: number }) => {
      updateViewport({ width: Math.max(1, ev.value) });
    });

  viewportFolder.addBinding(params, 'height', {
    readonly: true,
    label: 'Height',
  });

  const unsub = subscribe((scene) => {
    const vp = scene.viewport;
    const dims = computeViewportSize(scene);
    if (vp.aspect !== params.aspect) {
      params.aspect = vp.aspect;
    }
    if (vp.orientation !== params.orientation) {
      params.orientation = vp.orientation;
    }
    if (vp.width !== params.width) {
      params.width = vp.width;
    }
    const roundedHeight = Math.round(dims.height);
    if (roundedHeight !== params.height) {
      params.height = roundedHeight;
    }
    pane.refresh();
  });

  return () => {
    unsub();
    pane.dispose();
  };
}

