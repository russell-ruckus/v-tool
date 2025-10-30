/**
 * SVG instance renderer
 * Manages <use> elements for shape instances
 */
import type { Scene, Instance } from '@v-tool/shared';
import { sampleDistribution } from '../engine/sampler';
import { applySpacing } from '../../utils/spacing';
import { applyDepthToScale, applyRotation, sortByDepth } from '../../utils/transforms';

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

export const VIEWBOX_WIDTH = 800;
export const VIEWBOX_HEIGHT = 600;

export interface CanvasMetrics {
  scaleX: number;
  scaleY: number;
  uniformScale: number;
  worldScaleX: number;
  worldScaleY: number;
}

/**
 * Render shape instances in SVG
 * Supports multi-instance rendering with spacing functions
 */
export function renderInstances(
  svg: SVGSVGElement,
  scene: Scene,
  metrics?: CanvasMetrics
): void {
  let worldGroup = svg.querySelector('#world') as SVGGElement;
  if (!worldGroup) {
    worldGroup = document.createElementNS(SVG_NS, 'g');
    worldGroup.id = 'world';
    svg.appendChild(worldGroup);
  }

  let instanceGroup = worldGroup.querySelector('#instances') as SVGGElement;
  if (!instanceGroup) {
    instanceGroup = document.createElementNS(SVG_NS, 'g');
    instanceGroup.id = 'instances';
    worldGroup.appendChild(instanceGroup);
  }

  // Update world transform (center → pan → zoom)
  const { pan, zoom } = scene.view;
  const worldScaleX = (metrics?.worldScaleX ?? 1) * zoom;
  const worldScaleY = (metrics?.worldScaleY ?? 1) * zoom;
  const worldTransform = `translate(${VIEWBOX_WIDTH / 2} ${VIEWBOX_HEIGHT / 2}) scale(${worldScaleX} ${worldScaleY}) translate(${pan.x} ${pan.y})`;
  worldGroup.setAttribute('transform', worldTransform);

  // Clear existing instances
  instanceGroup.innerHTML = '';

  // Sample instances based on distribution
  let instances: Instance[] = [];

  if (scene.distribution.mode === 'path') {
    // Use dispatcher and apply spacing for path distributions
    instances = sampleDistribution(scene);

    // Apply spacing function
    const spacedPositions = applySpacing(
      instances.map((i) => ({ x: i.x, y: i.y })),
      scene.distribution.spacing
    );

    // Update x positions with spaced values
    instances = instances.map((inst, i) => ({
      ...inst,
      x: spacedPositions[i].x,
    }));
  } else if (scene.distribution.mode === 'particle') {
    // Particle distributions don't use spacing functions
    instances = sampleDistribution(scene);
  }

  // Apply transforms
  instances = applyDepthToScale(instances, scene.transform);
  instances = applyRotation(instances, scene.transform, scene.rng.seed);
  
  // Sort by depth if enabled
  if (scene.transform.sortByDepth) {
    instances = sortByDepth(instances);
  }

  // Performance optimization: use DocumentFragment for batch DOM creation
  const fragment = document.createDocumentFragment();

  const symbolId =
    scene.shape.type === 'basic' ? `shape-${scene.shape.shape}` : scene.shape.symbolId;

  instances.forEach((inst) => {
    const use = document.createElementNS(SVG_NS, 'use');
    // Set href using both modern and legacy methods for browser compatibility
    use.setAttribute('href', `#${symbolId}`);
    use.setAttributeNS(XLINK_NS, 'href', `#${symbolId}`);
    
    // Size with scale
    const scale = inst.scale ?? 1;
    const width = 50 * scale;
    const height = 50 * scale;
    
    // Position: offset by half width/height to center the shape
    // (since use elements anchor at top-left by default)
    use.setAttribute('x', (inst.x - width / 2).toString());
    use.setAttribute('y', (inst.y - height / 2).toString());
    
    use.setAttribute('width', width.toString());
    use.setAttribute('height', height.toString());
    
    // Rotation transform (already centered around inst.x, inst.y)
    if (inst.rotation !== 0) {
      const cx = inst.x;
      const cy = inst.y;
      use.setAttribute('transform', `rotate(${inst.rotation} ${cx} ${cy})`);
    }
    
    // Styling
    use.setAttribute('fill', scene.style.fill);
    use.setAttribute('stroke', scene.style.stroke);
    use.setAttribute('stroke-width', scene.style.strokeWidth.toString());

    fragment.appendChild(use);
  });

  instanceGroup.appendChild(fragment);
}
