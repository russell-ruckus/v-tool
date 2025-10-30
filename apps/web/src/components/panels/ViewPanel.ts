/**
 * View Panel UI
 * Controls for pan, zoom, overlay visibility, and fit-to-viewport
 */
import { Pane } from 'tweakpane';
import { getState, getView, subscribe, updateView } from '../../store/store';
import { clampViewToOverlay, computeFitView } from '../../utils/view';
import type { View } from '@v-tool/shared';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildPan(pan: View['pan'], patch: Partial<View['pan']>): View['pan'] {
  return { ...pan, ...patch };
}

export function ViewPanel(root: HTMLElement) {
  const pane = new Pane({
    container: root,
    title: 'View',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

  const view = getView();
  const params = {
    panX: view.pan.x,
    panY: view.pan.y,
    zoom: view.zoom,
    overlayVisible: view.overlayVisible,
  };

  const viewFolder = pane.addFolder({ title: 'View Controls', expanded: true });

  viewFolder
    .addBinding(params, 'panX', {
      min: -1000,
      max: 1000,
      step: 1,
      label: 'Pan X',
    })
    .on('change', (ev: { value: number }) => {
      const current = getView();
      updateView({ pan: buildPan(current.pan, { x: ev.value }) });
    });

  viewFolder
    .addBinding(params, 'panY', {
      min: -1000,
      max: 1000,
      step: 1,
      label: 'Pan Y',
    })
    .on('change', (ev: { value: number }) => {
      const current = getView();
      updateView({ pan: buildPan(current.pan, { y: ev.value }) });
    });

  viewFolder
    .addBinding(params, 'zoom', {
      min: MIN_ZOOM,
      max: MAX_ZOOM,
      step: 0.1,
      label: 'Zoom',
    })
    .on('change', (ev: { value: number }) => {
      const newZoom = clamp(ev.value, MIN_ZOOM, MAX_ZOOM);
      updateView({ zoom: newZoom });
    });

  viewFolder
    .addBinding(params, 'overlayVisible', {
      label: 'Show Overlay',
    })
    .on('change', (ev: { value: boolean }) => {
      updateView({ overlayVisible: ev.value });
    });

  viewFolder
    .addButton({ title: 'Fit to Viewport' })
    .on('click', () => {
      const scene = getState();
      const result = computeFitView(scene);
      if (!result) {
        return;
      }
      const zoom = clamp(result.zoom, MIN_ZOOM, MAX_ZOOM);
      if (scene.view.overlayVisible) {
        const clamped = clampViewToOverlay(scene, result.pan, zoom);
        updateView({ pan: clamped.pan, zoom: clamped.zoom });
      } else {
        updateView({ pan: result.pan, zoom });
      }
    });

  const unsub = subscribe((scene) => {
    const nextView = scene.view;
    if (nextView.pan.x !== params.panX) {
      params.panX = nextView.pan.x;
    }
    if (nextView.pan.y !== params.panY) {
      params.panY = nextView.pan.y;
    }
    if (nextView.zoom !== params.zoom) {
      params.zoom = nextView.zoom;
    }
    if (nextView.overlayVisible !== params.overlayVisible) {
      params.overlayVisible = nextView.overlayVisible;
    }
    pane.refresh();
  });

  return () => {
    unsub();
    pane.dispose();
  };
}

