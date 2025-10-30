import type { Scene, View } from '@v-tool/shared';
import { sampleDistribution } from '../components/engine/sampler';
import { applySpacing } from './spacing';
import { applyDepthToScale, applyRotation } from './transforms';

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

const BASE_SHAPE_SIZE = 50;

export function computeInstanceBounds(scene: Scene): Bounds | null {
  let instances = sampleDistribution(scene);

  if (scene.distribution.mode === 'path') {
    const spaced = applySpacing(
      instances.map((inst) => ({ x: inst.x, y: inst.y })),
      scene.distribution.spacing
    );
    instances = instances.map((inst, index) => ({ ...inst, x: spaced[index].x, y: spaced[index].y }));
  }

  if (instances.length === 0) {
    return null;
  }

  instances = applyDepthToScale(instances, scene.transform);
  instances = applyRotation(instances, scene.transform, scene.rng.seed);

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const inst of instances) {
    const scale = inst.scale ?? 1;
    const width = BASE_SHAPE_SIZE * scale;
    const height = BASE_SHAPE_SIZE * scale;
    const cx = inst.x + width / 2;
    const cy = inst.y + height / 2;
    const angle = (inst.rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const corners: Array<{ x: number; y: number }> = [
      { x: inst.x, y: inst.y },
      { x: inst.x + width, y: inst.y },
      { x: inst.x + width, y: inst.y + height },
      { x: inst.x, y: inst.y + height },
    ];

    for (const corner of corners) {
      const offsetX = corner.x - cx;
      const offsetY = corner.y - cy;
      const rotatedX = cx + offsetX * cos - offsetY * sin;
      const rotatedY = cy + offsetX * sin + offsetY * cos;
      if (rotatedX < minX) minX = rotatedX;
      if (rotatedX > maxX) maxX = rotatedX;
      if (rotatedY < minY) minY = rotatedY;
      if (rotatedY > maxY) maxY = rotatedY;
    }
  }

  return { minX, maxX, minY, maxY };
}

export function computeViewportSize(scene: Scene): ViewportSize {
  const [ratioW, ratioH] = scene.viewport.aspect.split(':').map(Number);
  const baseWidth = scene.viewport.width;
  if (scene.viewport.orientation === 'landscape') {
    const height = (baseWidth * ratioH) / ratioW;
    return { width: baseWidth, height };
  }
  const width = (baseWidth * ratioH) / ratioW;
  return { width, height: baseWidth };
}

export function computeFitView(scene: Scene): { pan: View['pan']; zoom: number } | null {
  const bounds = computeInstanceBounds(scene);
  if (!bounds) {
    return null;
  }

  const contentWidth = bounds.maxX - bounds.minX || 1;
  const contentHeight = bounds.maxY - bounds.minY || 1;
  const contentCenterX = (bounds.minX + bounds.maxX) / 2;
  const contentCenterY = (bounds.minY + bounds.maxY) / 2;

  const viewportSize = computeViewportSize(scene);
  const scaleX = viewportSize.width / contentWidth;
  const scaleY = viewportSize.height / contentHeight;
  const targetZoom = Math.min(scaleX, scaleY);

  const pan: View['pan'] = {
    x: -contentCenterX,
    y: -contentCenterY,
  };

  return { pan, zoom: targetZoom };
}

export function clampViewToOverlay(
  scene: Scene,
  pan: View['pan'],
  zoom: number
): { pan: View['pan']; zoom: number } {
  const bounds = computeInstanceBounds(scene);
  if (!bounds) {
    return { pan, zoom: clamp(zoom, 0.1, 10) };
  }

  const viewportSize = computeViewportSize(scene);
  const halfW = viewportSize.width / 2;
  const halfH = viewportSize.height / 2;

  const contentWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const contentHeight = Math.max(bounds.maxY - bounds.minY, 1);
  const maxZoomCandidate = Math.min(viewportSize.width / contentWidth, viewportSize.height / contentHeight);
  const allowedMaxZoom = Math.min(10, maxZoomCandidate);
  let nextZoom = zoom;
  if (!Number.isNaN(allowedMaxZoom) && allowedMaxZoom > 0) {
    nextZoom = Math.min(zoom, allowedMaxZoom);
  }
  const clampedZoom = allowedMaxZoom < 0.1 ? Math.max(allowedMaxZoom, 0.01) : clamp(nextZoom, 0.1, 10);

  const minPanX = (-halfW / clampedZoom) - bounds.minX;
  const maxPanX = (halfW / clampedZoom) - bounds.maxX;
  const minPanY = (-halfH / clampedZoom) - bounds.minY;
  const maxPanY = (halfH / clampedZoom) - bounds.maxY;

  return {
    zoom: clampedZoom,
    pan: {
      x: clamp(pan.x, minPanX, maxPanX),
      y: clamp(pan.y, minPanY, maxPanY),
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    return max;
  }
  return Math.min(max, Math.max(min, value));
}

