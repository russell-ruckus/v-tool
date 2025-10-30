/**
 * Canvas component - renders SVG scene with shapes
 */
import { getState, getView, subscribe, updateView } from '../../store/store';
import { renderInstances, type CanvasMetrics, VIEWBOX_HEIGHT, VIEWBOX_WIDTH } from './Renderer';
import {
  createSquareSymbol,
  createCircleSymbol,
  createTriangleSymbol,
} from '../../utils/shapes';
import { ensureUploadedSymbol, getUploadedSymbol } from '../../services/svgUpload';
import { computeViewportSize } from '../../utils/view';
import type { ShapeSource, View, Scene } from '@v-tool/shared';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEW_CENTRE = { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 };

function computeCanvasMetrics(svg: SVGSVGElement): CanvasMetrics {
  const rect = svg.getBoundingClientRect();
  const width = rect.width || VIEWBOX_WIDTH;
  const height = rect.height || VIEWBOX_HEIGHT;

  const scaleX = width > 0 ? width / VIEWBOX_WIDTH : 1;
  const scaleY = height > 0 ? height / VIEWBOX_HEIGHT : 1;
  const uniformScale = Math.min(scaleX, scaleY) || 1;

  const worldScaleX = scaleX > 0 ? uniformScale / scaleX : 1;
  const worldScaleY = scaleY > 0 ? uniformScale / scaleY : 1;

  return {
    scaleX,
    scaleY,
    uniformScale,
    worldScaleX,
    worldScaleY,
  };
}

/**
 * Update shape definitions in <defs>
 */
function updateShapeDefinitions(defs: SVGDefsElement, shape: ShapeSource): void {
  // Clear existing symbols
  defs.innerHTML = '';

  // Add appropriate symbol based on shape
  if (shape.type === 'basic') {
    let symbol: SVGSymbolElement;

    switch (shape.shape) {
      case 'square':
        symbol = createSquareSymbol();
        break;
      case 'circle':
        symbol = createCircleSymbol();
        break;
      case 'triangle':
        symbol = createTriangleSymbol();
        break;
    }

    defs.appendChild(symbol);
  } else if (shape.type === 'uploaded') {
    ensureUploadedSymbol(shape);
    const uploaded = getUploadedSymbol(shape.symbolId);
    if (uploaded) {
      uploaded.id = shape.symbolId;
      uploaded.setAttribute('viewBox', shape.viewBox.join(' '));
      defs.appendChild(uploaded);
    } else {
      console.warn('Uploaded symbol not found in registry', shape.symbolId);
    }
  }
}

export function Canvas(root: HTMLElement) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 800 600');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'V-Tool canvas for SVG instance distribution');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.background = '#fff';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.display = 'block';

  // Create <defs> section for shape symbols
  const defs = document.createElementNS(SVG_NS, 'defs');
  svg.appendChild(defs);

  const overlayShade = document.createElementNS(SVG_NS, 'path');
  overlayShade.id = 'viewport-overlay-shade';
  overlayShade.setAttribute('fill', 'rgba(51, 51, 51, 0.75)');
  overlayShade.setAttribute('fill-rule', 'evenodd');

  const overlayGroup = document.createElementNS(SVG_NS, 'g');
  overlayGroup.id = 'viewport-overlay-group';
  overlayGroup.setAttribute('pointer-events', 'none');

  const overlayRect = document.createElementNS(SVG_NS, 'rect');
  overlayRect.id = 'viewport-overlay';
  overlayRect.setAttribute('fill', 'none');
  overlayRect.setAttribute('stroke', '#333333');
  overlayRect.setAttribute('stroke-width', '.5');

  const overlayGuideH = document.createElementNS(SVG_NS, 'line');
  overlayGuideH.id = 'viewport-overlay-guide-horizontal';
  overlayGuideH.setAttribute('stroke', '#5a7ff6');
  overlayGuideH.setAttribute('stroke-width', '.5');

  const overlayGuideV = document.createElementNS(SVG_NS, 'line');
  overlayGuideV.id = 'viewport-overlay-guide-vertical';
  overlayGuideV.setAttribute('stroke', '#5a7ff6');
  overlayGuideV.setAttribute('stroke-width', '.5');

  overlayGroup.appendChild(overlayRect);
  overlayGroup.appendChild(overlayGuideH);
  overlayGroup.appendChild(overlayGuideV);

  root.appendChild(svg);
  
  // Helper to ensure overlay elements are always last (render on top)
  function ensureOverlayOnTop(): void {
    const worldGroup = svg.querySelector('#world');
    if (worldGroup && overlayShade.parentNode && overlayGroup.parentNode) {
      // Move overlay elements to end if they exist but world is before them
      if (worldGroup.nextSibling !== overlayShade) {
        svg.appendChild(overlayShade);
        svg.appendChild(overlayGroup);
      }
    }
  }

  function updateOverlay(scene: Scene, metrics: CanvasMetrics): void {
    const { width, height } = computeViewportSize(scene);
    const x = VIEW_CENTRE.x - width / 2;
    const y = VIEW_CENTRE.y - height / 2;
    const display = scene.view.overlayVisible ? 'block' : 'none';

    const transform = `translate(${VIEWBOX_WIDTH / 2} ${VIEWBOX_HEIGHT / 2}) scale(${metrics.worldScaleX} ${metrics.worldScaleY}) translate(${-VIEWBOX_WIDTH / 2} ${-VIEWBOX_HEIGHT / 2})`;
    overlayGroup.setAttribute('transform', transform);

    overlayRect.setAttribute('x', x.toString());
    overlayRect.setAttribute('y', y.toString());
    overlayRect.setAttribute('width', width.toString());
    overlayRect.setAttribute('height', height.toString());
    overlayRect.style.display = display;

    const innerWidthView = width * metrics.worldScaleX;
    const innerHeightView = height * metrics.worldScaleY;
    const innerX = VIEWBOX_WIDTH / 2 - innerWidthView / 2;
    const innerY = VIEWBOX_HEIGHT / 2 - innerHeightView / 2;
    const shadePath = `M0 0H${VIEWBOX_WIDTH}V${VIEWBOX_HEIGHT}H0Z M${innerX} ${innerY}H${innerX + innerWidthView}V${innerY + innerHeightView}H${innerX}Z`;
    overlayShade.setAttribute('d', shadePath);
    overlayShade.style.display = display;

    overlayGuideH.setAttribute('x1', x.toString());
    overlayGuideH.setAttribute('y1', (y + height / 2).toString());
    overlayGuideH.setAttribute('x2', (x + width).toString());
    overlayGuideH.setAttribute('y2', (y + height / 2).toString());
    overlayGuideH.style.display = display;

    overlayGuideV.setAttribute('x1', (x + width / 2).toString());
    overlayGuideV.setAttribute('y1', y.toString());
    overlayGuideV.setAttribute('x2', (x + width / 2).toString());
    overlayGuideV.setAttribute('y2', (y + height).toString());
    overlayGuideV.style.display = display;
    overlayGroup.style.display = display;
  }

  let lastShape: ShapeSource | null = null;

  // Input handling state
  let dragState: {
    pointerId: number;
    startClient: { x: number; y: number };
    startPan: { x: number; y: number };
  } | null = null;
  let pendingPan: { x: number; y: number } | null = null;
  let pendingZoom: number | null = null;
  let rafId: number | null = null;

  function commitViewUpdate(): void {
    if (pendingPan === null && pendingZoom === null) {
      return;
    }
    const currentScene = getState();
    let nextPan = pendingPan ?? currentScene.view.pan;
    let nextZoom = pendingZoom ?? currentScene.view.zoom;

    const patch: Partial<View> = {};
    if (pendingPan !== null || nextPan !== currentScene.view.pan) {
      patch.pan = nextPan;
    }
    if (pendingZoom !== null || nextZoom !== currentScene.view.zoom) {
      patch.zoom = nextZoom;
    }
    pendingPan = null;
    pendingZoom = null;
    rafId = null;
    if (Object.keys(patch).length > 0) {
      updateView(patch);
    }
  }

  function scheduleCommit(): void {
    if (rafId !== null) {
      return;
    }
    rafId = window.requestAnimationFrame(commitViewUpdate);
  }

  function handlePointerDown(ev: PointerEvent): void {
    if (ev.button !== 0) {
      return;
    }
    const view = getView();
    dragState = {
      pointerId: ev.pointerId,
      startClient: { x: ev.clientX, y: ev.clientY },
      startPan: { ...view.pan },
    };
    svg.setPointerCapture(ev.pointerId);
  }

  function handlePointerMove(ev: PointerEvent): void {
    if (!dragState || ev.pointerId !== dragState.pointerId) {
      return;
    }
    const zoom = getView().zoom;
    const metrics = computeCanvasMetrics(svg);
    const effectiveScale = Math.max(metrics.uniformScale * zoom, 1e-6);
    const dx = (ev.clientX - dragState.startClient.x) / effectiveScale;
    const dy = (ev.clientY - dragState.startClient.y) / effectiveScale;
    pendingPan = {
      x: dragState.startPan.x + dx,
      y: dragState.startPan.y + dy,
    };
    scheduleCommit();
  }

  function endPan(ev: PointerEvent): void {
    if (!dragState || ev.pointerId !== dragState.pointerId) {
      return;
    }
    svg.releasePointerCapture(ev.pointerId);
    dragState = null;
  }

  function handleWheel(ev: WheelEvent): void {
    ev.preventDefault();
    const view = getView();
    const currentZoom = view.zoom;
    const zoomFactor = Math.exp(-ev.deltaY * 0.001);
    const rawZoom = currentZoom * zoomFactor;
    const newZoom = Math.min(10, Math.max(0.1, rawZoom));

    if (newZoom === currentZoom) {
      return;
    }

    const rect = svg.getBoundingClientRect();
    const canvasX = ev.clientX - rect.left;
    const canvasY = ev.clientY - rect.top;
    const metrics = computeCanvasMetrics(svg);
    const viewBoxX = canvasX / (metrics.scaleX || 1);
    const viewBoxY = canvasY / (metrics.scaleY || 1);
    const centreViewX = VIEWBOX_WIDTH / 2;
    const centreViewY = VIEWBOX_HEIGHT / 2;

    const scaleWorldXCurrent = Math.max(metrics.worldScaleX * currentZoom, 1e-6);
    const scaleWorldYCurrent = Math.max(metrics.worldScaleY * currentZoom, 1e-6);

    const worldX = (viewBoxX - centreViewX) / scaleWorldXCurrent - view.pan.x;
    const worldY = (viewBoxY - centreViewY) / scaleWorldYCurrent - view.pan.y;

    const scaleWorldXNew = Math.max(metrics.worldScaleX * newZoom, 1e-6);
    const scaleWorldYNew = Math.max(metrics.worldScaleY * newZoom, 1e-6);

    let nextPan = {
      x: (viewBoxX - centreViewX) / scaleWorldXNew - worldX,
      y: (viewBoxY - centreViewY) / scaleWorldYNew - worldY,
    };

    pendingZoom = newZoom;
    pendingPan = nextPan;
    scheduleCommit();
  }

  svg.addEventListener('pointerdown', handlePointerDown);
  svg.addEventListener('pointermove', handlePointerMove);
  svg.addEventListener('pointerup', endPan);
  svg.addEventListener('pointercancel', endPan);
  svg.addEventListener('pointerleave', endPan);
  svg.addEventListener('wheel', handleWheel, { passive: false });

  // Subscribe to state changes
  const unsub = subscribe((scene) => {
    if (scene.shape !== lastShape) {
      updateShapeDefinitions(defs, scene.shape);
      lastShape = scene.shape;
    }
    const metrics = computeCanvasMetrics(svg);
    renderInstances(svg, scene, metrics);
    ensureOverlayOnTop();
    updateOverlay(scene, metrics);
  });

  // Initial render
  const initialScene = getState();
  updateShapeDefinitions(defs, initialScene.shape);
  lastShape = initialScene.shape;
  const initialMetrics = computeCanvasMetrics(svg);
  renderInstances(svg, initialScene, initialMetrics);
  // Append overlay elements after #world to ensure they render on top
  svg.appendChild(overlayShade);
  svg.appendChild(overlayGroup);
  updateOverlay(initialScene, initialMetrics);

  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      const scene = getState();
      const metrics = computeCanvasMetrics(svg);
      renderInstances(svg, scene, metrics);
      ensureOverlayOnTop();
      updateOverlay(scene, metrics);
    });
    resizeObserver.observe(svg);
  }

  // Return cleanup function
  return () => {
    unsub();
    svg.removeEventListener('pointerdown', handlePointerDown);
    svg.removeEventListener('pointermove', handlePointerMove);
    svg.removeEventListener('pointerup', endPan);
    svg.removeEventListener('pointercancel', endPan);
    svg.removeEventListener('pointerleave', endPan);
    svg.removeEventListener('wheel', handleWheel);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    // Defensive check: only remove if still a child
    if (svg.parentNode === root) {
      root.removeChild(svg);
    }
  };
}
