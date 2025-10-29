/**
 * SVG instance renderer
 * Manages <use> elements for shape instances
 */
import type { Scene, Instance } from '@v-tool/shared';
import { sampleLinearPath } from '../engine/pathSampler';
import { applySpacing } from '../../utils/spacing';

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

/**
 * Render shape instances in SVG
 * Supports multi-instance rendering with spacing functions
 */
export function renderInstances(svg: SVGSVGElement, scene: Scene): void {
  let instanceGroup = svg.querySelector('#instances') as SVGGElement;

  if (!instanceGroup) {
    instanceGroup = document.createElementNS(SVG_NS, 'g');
    instanceGroup.id = 'instances';
    svg.appendChild(instanceGroup);
  }

  // Clear existing instances
  instanceGroup.innerHTML = '';

  // Sample instances based on distribution
  let instances: Instance[] = [];

  if (scene.distribution.mode === 'path') {
    instances = sampleLinearPath(scene.distribution);

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
    // Convert symbol coordinates (-1 to 1) to canvas coordinates
    // Canvas center is 400, 300. Position relative to center
    use.setAttribute('x', (400 + inst.x).toString());
    use.setAttribute('y', (300 + inst.y).toString());
    use.setAttribute('width', '50');
    use.setAttribute('height', '50');
    use.setAttribute('fill', scene.style.fill);
    use.setAttribute('stroke', scene.style.stroke);
    use.setAttribute('stroke-width', scene.style.strokeWidth.toString());

    fragment.appendChild(use);
  });

  instanceGroup.appendChild(fragment);
}
