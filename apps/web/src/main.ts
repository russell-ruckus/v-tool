import { Canvas } from './components/canvas/Canvas';
import { ObjectPanel } from './components/panels/ObjectPanel';
import { DistributionPanel } from './components/panels/DistributionPanel';
import { init } from './store/store';
import type { Scene } from '@v-tool/shared';

// Initialize store with complete default scene
const initialScene: Scene = {
  id: '1',
  version: '1.0',
  rng: { seed: 12345 },
  shape: { type: 'basic', shape: 'square' },
  distribution: {
    mode: 'path',
    path: { type: 'linear', instances: 10 },
    spacing: 'linear',
  },
  transform: {
    rotation: { mode: 'fixed', value: 0 },
    sortByDepth: false,
  },
  style: {
    fill: '#3b82f6',
    stroke: '#1e40af',
    strokeWidth: 1,
    background: '#ffffff',
  },
  view: {
    pan: { x: 0, y: 0 },
    zoom: 1,
    overlayVisible: true,
  },
  viewport: {
    aspect: '16:9',
    orientation: 'landscape',
    width: 800,
  },
  export: {
    precision: 2,
    useSymbols: true,
    clipToViewport: true,
  },
};

init(initialScene);

// Initialize UI components
const canvasRoot = document.getElementById('canvas-container');
const panelsRoot = document.getElementById('panels-container');

if (!canvasRoot || !panelsRoot) {
  console.error('Failed to initialize V-Tool: Required DOM elements not found');
  document.body.innerHTML =
    '<div style="padding: 20px; color: red;">Error: Failed to initialize application. Please refresh the page.</div>';
} else {
  Canvas(canvasRoot);
  ObjectPanel(panelsRoot);
  DistributionPanel(panelsRoot);
}
