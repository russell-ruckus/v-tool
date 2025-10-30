/**
 * ObjectPanel - shape selection and SVG upload
 */
import { Pane } from 'tweakpane';
import { getState, update } from '../../store/store';
import type { BasicShape, ShapeSource } from '@v-tool/shared';
import { validateSVG, sanitizeSVG, normalizeSVG, createSymbolFromSVG } from '../../services/svgUpload';

export function ObjectPanel(root: HTMLElement) {
  const pane = new Pane({ container: root, title: 'Object' }) as any; // tweakpane typing workaround

  const scene = getState();
  const params = {
    shapeType: scene.shape.type,
    basicShape: scene.shape.type === 'basic' ? scene.shape.shape : 'square',
    uploadStatus: '' as string,
  };

  let refreshStatus: (() => void) | null = null;

  // Shape type toggle
  const shapeTypeBlade = pane
    .addBlade({
      view: 'list',
      label: 'Shape Type',
      options: [
        { text: 'Basic', value: 'basic' },
        { text: 'Uploaded', value: 'uploaded' },
      ],
      value: params.shapeType,
    })
    .on('change', (ev: { value: 'basic' | 'uploaded' }) => {
      params.shapeType = ev.value;
      params.uploadStatus = '';
      refreshStatus?.();
      if (ev.value === 'basic') {
        update({ shape: { type: 'basic', shape: params.basicShape as BasicShape } as ShapeSource });
      }
      pane.refresh();
    });

  // Basic shape selector
  pane
    .addBlade({
      view: 'list',
      label: 'Basic Shape',
      options: [
        { text: 'Square', value: 'square' },
        { text: 'Circle', value: 'circle' },
        { text: 'Triangle', value: 'triangle' },
      ],
      value: params.basicShape,
    })
    .on('change', (ev: { value: BasicShape }) => {
      params.basicShape = ev.value;
      if (params.shapeType === 'basic') {
        update({ shape: { type: 'basic', shape: ev.value } as ShapeSource });
      }
    });

  // Upload controls
  const uploadFolder = pane.addFolder({ title: 'Upload', expanded: true });
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.svg,image/svg+xml';
  fileInput.style.display = 'none';
  root.appendChild(fileInput);

  const uploadButton = uploadFolder.addButton({ title: 'Upload SVG' });
  uploadButton.on('click', () => fileInput.click());

  const statusBinding = uploadFolder.addBinding(params, 'uploadStatus', { label: 'Status' });
  refreshStatus = () => statusBinding.refresh();

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    uploadButton.disabled = true;
    params.uploadStatus = 'Processing...';
    refreshStatus?.();
    try {
      const text = await file.text();
      const validation = validateSVG(text);
      if (!validation.valid) {
        params.uploadStatus = `Rejected: ${validation.reason}`;
        refreshStatus?.();
        return;
      }
      const sanitized = sanitizeSVG(text);
      const normalized = normalizeSVG(sanitized);
      const { symbolId, viewBox, content } = createSymbolFromSVG(normalized);
      // Update scene shape to uploaded
      params.shapeType = 'uploaded';
      update({ shape: { type: 'uploaded', symbolId, viewBox, content } as ShapeSource });
      shapeTypeBlade.refresh();
      // Store symbol in DOM defs on next Canvas render
      params.uploadStatus = `${file.name} uploaded`;
      refreshStatus?.();
    } catch (e) {
      params.uploadStatus = 'Upload failed';
      refreshStatus?.();
    } finally {
      fileInput.value = '';
      uploadButton.disabled = false;
    }
  });

  // Cleanup
  return () => {
    pane.dispose();
    if (fileInput.parentNode === root) root.removeChild(fileInput);
  };
}
