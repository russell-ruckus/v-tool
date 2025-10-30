/**
 * Transform Panel UI
 * Provides controls for depth→scale mapping, rotation, and render ordering
 */
import { Pane } from 'tweakpane';
import { getState, update, subscribe } from '../../store/store';

export function TransformPanel(root: HTMLElement) {
  const pane = new Pane({
    container: root,
    title: 'Transform',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any; // Type workaround for Tweakpane 4.x
  const state = getState();
  
  const params = {
    depthMin: state.transform.depthRange[0],
    depthMax: state.transform.depthRange[1],
    scaleMin: state.transform.scaleRange[0],
    scaleMax: state.transform.scaleRange[1],
    rotationMode: state.transform.rotation.mode,
    rotationValue: state.transform.rotation.value ?? 0,
    rotationMin: state.transform.rotation.min ?? 0,
    rotationMax: state.transform.rotation.max ?? 360,
    sortByDepth: state.transform.sortByDepth,
  };
  
  // Depth range
  const depthFolder = pane.addFolder({ title: 'Depth', expanded: true });
  depthFolder.addBinding(params, 'depthMin', {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Min',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    update({
      transform: {
        ...currentState.transform,
        depthRange: [ev.value, currentState.transform.depthRange[1]],
      },
    });
  });
  
  depthFolder.addBinding(params, 'depthMax', {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Max',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    update({
      transform: {
        ...currentState.transform,
        depthRange: [currentState.transform.depthRange[0], ev.value],
      },
    });
  });
  
  // Scale range
  const scaleFolder = pane.addFolder({ title: 'Scale', expanded: true });
  scaleFolder.addBinding(params, 'scaleMin', {
    min: 0.1,
    max: 2.0,
    step: 0.1,
    label: 'Min',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    update({
      transform: {
        ...currentState.transform,
        scaleRange: [ev.value, currentState.transform.scaleRange[1]],
      },
    });
  });
  
  scaleFolder.addBinding(params, 'scaleMax', {
    min: 0.1,
    max: 2.0,
    step: 0.1,
    label: 'Max',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    update({
      transform: {
        ...currentState.transform,
        scaleRange: [currentState.transform.scaleRange[0], ev.value],
      },
    });
  });
  
  // Rotation
  const rotationFolder = pane.addFolder({ title: 'Rotation', expanded: true });
  rotationFolder.addBinding(params, 'rotationMode', {
    options: { Fixed: 'fixed', Range: 'range' },
    label: 'Mode',
  }).on('change', (ev: { value: 'fixed' | 'range' }) => {
    const currentState = getState();
    update({
      transform: {
        ...currentState.transform,
        rotation: ev.value === 'fixed'
          ? { mode: 'fixed', value: 0 }
          : { mode: 'range', min: 0, max: 360 },
      },
    });
  });
  
  // Fixed rotation controls (created but hidden/shown based on mode)
  const fixedRotationBinding = rotationFolder.addBinding(params, 'rotationValue', {
    min: 0,
    max: 360,
    step: 1,
    label: 'Angle',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    update({
      transform: {
        ...currentState.transform,
        rotation: { ...currentState.transform.rotation, value: ev.value },
      },
    });
  });
  
  // Range rotation controls (created but hidden/shown based on mode)
  const rangeMinBinding = rotationFolder.addBinding(params, 'rotationMin', {
    min: 0,
    max: 360,
    step: 1,
    label: 'Min',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    update({
      transform: {
        ...currentState.transform,
        rotation: { ...currentState.transform.rotation, min: ev.value },
      },
    });
  });
  
  const rangeMaxBinding = rotationFolder.addBinding(params, 'rotationMax', {
    min: 0,
    max: 360,
    step: 1,
    label: 'Max',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    update({
      transform: {
        ...currentState.transform,
        rotation: { ...currentState.transform.rotation, max: ev.value },
      },
    });
  });
  
  // Show/hide rotation controls based on current mode
  function updateRotationControls() {
    const isFixed = params.rotationMode === 'fixed';
    fixedRotationBinding.hidden = !isFixed;
    rangeMinBinding.hidden = isFixed;
    rangeMaxBinding.hidden = isFixed;
  }
  
  // Initial visibility
  updateRotationControls();
  
  // Sort by depth
  pane.addBinding(params, 'sortByDepth', {
    label: 'Sort by Depth',
  }).on('change', (ev: { value: boolean }) => {
    const currentState = getState();
    update({
      transform: {
        ...currentState.transform,
        sortByDepth: ev.value,
      },
    });
  });
  
  // Subscribe to external state changes
  const unsub = subscribe((scene) => {
    const newT = scene.transform;
    
    // Update depth range params
    if (newT.depthRange[0] !== params.depthMin) {
      params.depthMin = newT.depthRange[0];
    }
    if (newT.depthRange[1] !== params.depthMax) {
      params.depthMax = newT.depthRange[1];
    }
    
    // Update scale range params
    if (newT.scaleRange[0] !== params.scaleMin) {
      params.scaleMin = newT.scaleRange[0];
    }
    if (newT.scaleRange[1] !== params.scaleMax) {
      params.scaleMax = newT.scaleRange[1];
    }
    
    // Update rotation params
    if (newT.rotation.mode !== params.rotationMode) {
      params.rotationMode = newT.rotation.mode;
      updateRotationControls();
    }
    
    if (newT.rotation.value !== undefined && newT.rotation.value !== params.rotationValue) {
      params.rotationValue = newT.rotation.value;
    }
    
    if (newT.rotation.min !== undefined && newT.rotation.min !== params.rotationMin) {
      params.rotationMin = newT.rotation.min;
    }
    
    if (newT.rotation.max !== undefined && newT.rotation.max !== params.rotationMax) {
      params.rotationMax = newT.rotation.max;
    }
    
    // Update sort by depth
    if (newT.sortByDepth !== params.sortByDepth) {
      params.sortByDepth = newT.sortByDepth;
    }
    
    pane.refresh(); // Refresh the UI to reflect state changes
  });
  
  return () => {
    unsub();
    pane.dispose();
  };
}
