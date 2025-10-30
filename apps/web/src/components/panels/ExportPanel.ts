/**
 * Export Panel UI
 * Exports SVG with maximum precision for best accuracy
 */
import { Pane } from 'tweakpane';
import { getState, subscribe } from '../../store/store';
import { exportSVG, downloadSVG, estimateFileSize } from '../../services/export';

export function ExportPanel(root: HTMLElement) {
  const pane = new Pane({
    container: root,
    title: 'Export',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

  const params = {
    estimatedSize: '0 KB',
  };

  const exportFolder = pane.addFolder({ title: 'Export Settings', expanded: true });

  const estimatedSizeBinding = exportFolder.addBinding(params, 'estimatedSize', {
    readonly: true,
    label: 'Estimated Size',
  });

  // Export button
  exportFolder
    .addButton({ title: 'Export SVG' })
    .on('click', () => {
      const svg = document.querySelector('svg') as SVGSVGElement | null;
      if (!svg) {
        console.warn('No SVG element found for export');
        return;
      }
      const current = getState();
      const exported = exportSVG(svg, current);
      const size = estimateFileSize(exported);
      const filename = `export-${Date.now()}.svg`;
      downloadSVG(exported, filename);
      // Update estimated size after export
      params.estimatedSize = `${size} KB`;
      estimatedSizeBinding.refresh();
    });

  // Update estimated size
  function updateEstimatedSize() {
    const svg = document.querySelector('svg') as SVGSVGElement | null;
    if (!svg) {
      params.estimatedSize = '0 KB';
      estimatedSizeBinding.refresh();
      return;
    }
    const current = getState();
    const exported = exportSVG(svg, current);
    const size = estimateFileSize(exported);
    params.estimatedSize = `${size} KB`;
    estimatedSizeBinding.refresh();
  }

  const unsub = subscribe(() => {
    // Update estimated size when scene changes (may affect export size)
    updateEstimatedSize();
  });

  // Initial size estimate (defer to allow SVG to be created)
  setTimeout(() => {
    updateEstimatedSize();
  }, 100);

  // Return cleanup function
  return () => {
    unsub();
    pane.dispose();
  };
}

