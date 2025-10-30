/**
 * DistributionPanel component - distribution mode and controls
 * Supports both Path and Particle distribution modes
 */
import { Pane } from 'tweakpane';
import { getState, update, subscribe } from '../../store/store';
import type { Distribution, SpacingFn, PathType } from '@v-tool/shared';

export function DistributionPanel(root: HTMLElement) {
  const pane = new Pane({
    container: root,
    title: 'Distribution',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any; // Type workaround for Tweakpane 4.x

  const state = getState();

  // Initialize params based on current distribution mode
  const params = {
    mode: state.distribution.mode,
    // RNG
    seed: state.rng.seed,
    // Path params
    pathType: state.distribution.mode === 'path' ? state.distribution.path.type : 'linear',
    instances: state.distribution.mode === 'path' ? state.distribution.path.instances : 10,
    frequency: state.distribution.mode === 'path' ? (state.distribution.path.frequency ?? 1.0) : 1.0,
    amplitude: state.distribution.mode === 'path' ? (state.distribution.path.amplitude ?? 50) : 50,
    spacing: state.distribution.mode === 'path' ? state.distribution.spacing : 'linear',
    // Particle params
    particleType: state.distribution.mode === 'particle' ? state.distribution.particle.type : 'grid',
    density: state.distribution.mode === 'particle' ? state.distribution.particle.density : 20,
    jitter: state.distribution.mode === 'particle' && state.distribution.particle.type === 'grid' 
      ? state.distribution.particle.jitter : 0.3,
  };

  // Distribution mode dropdown
  pane
    .addBlade({
      view: 'list',
      label: 'Mode',
      options: [
        { text: 'Path', value: 'path' },
        { text: 'Particle', value: 'particle' },
      ],
      value: params.mode,
    })
    .on('change', (ev: { value: 'path' | 'particle' }) => {
      if (ev.value === 'path') {
        update({
          distribution: {
            mode: 'path',
            path: { type: 'linear', instances: 10, frequency: 1.0, amplitude: 50 },
            spacing: 'linear',
          } as Distribution,
        });
      } else {
        update({
          distribution: {
            mode: 'particle',
            particle: { type: 'grid', density: 20, jitter: 0.3 },
          } as Distribution,
        });
      }
    });

  // Seed controls
  const seedFolder = pane.addFolder({ title: 'Seed', expanded: true });

  // Seed input
  seedFolder
    .addBinding(params, 'seed', {
      min: 0,
      max: 999999,
      step: 1,
      label: 'Seed',
    })
    .on('change', (ev: { value: number }) => {
      const clamped = Math.max(0, Math.min(999999, Math.floor(ev.value)));
      update({ rng: { seed: clamped } });
    });

  // Generate new seed button
  seedFolder
    .addButton({ title: 'Generate New Seed' })
    .on('click', () => {
      const newSeed = Math.floor(Math.random() * 1000000);
      update({ rng: { seed: newSeed } });
    });

  // Path controls folder
  const pathFolder = pane.addFolder({ title: 'Path Controls', expanded: params.mode === 'path' });
  
  // Path type dropdown
  pathFolder
    .addBlade({
      view: 'list',
      label: 'Path Type',
      options: [
        { text: 'Linear', value: 'linear' },
        { text: 'Sine', value: 'sine' },
        { text: 'Bezier', value: 'bezier' },
        { text: 'Parametric', value: 'parametric' },
        { text: 'Spiral', value: 'spiral' },
        { text: 'Ellipse', value: 'ellipse' },
        { text: 'Polygon', value: 'polygon' },
        { text: 'Arc', value: 'arc' },
      ],
      value: params.pathType,
    })
    .on('change', (ev: { value: PathType }) => {
      const currentState = getState();
      if (currentState.distribution.mode === 'path') {
        const currentD = currentState.distribution;
        const defaultCtrlPoints = [
          { x: -300, y: 0 },
          { x: -100, y: -100 },
          { x: 100, y: 100 },
          { x: 300, y: 0 },
        ];
        update({
          distribution: {
            ...currentD,
            path: { 
              ...currentD.path, 
              type: ev.value,
              frequency: currentD.path.frequency ?? 1.0,
              amplitude: currentD.path.amplitude ?? 50,
              ctrlPoints: ev.value === 'bezier' ? (currentD.path.ctrlPoints ?? defaultCtrlPoints) : undefined,
              parametricX: ev.value === 'parametric' ? (currentD.path.parametricX ?? 't * 600 - 300') : undefined,
              parametricY: ev.value === 'parametric' ? (currentD.path.parametricY ?? 'Math.sin(t * 2 * Math.PI * frequency) * 50') : undefined,
              spiralTurns: ev.value === 'spiral' ? (currentD.path.spiralTurns ?? 3) : undefined,
              spiralRadius: ev.value === 'spiral' ? (currentD.path.spiralRadius ?? 200) : undefined,
              ellipseRadiusX: ev.value === 'ellipse' ? (currentD.path.ellipseRadiusX ?? 250) : undefined,
              ellipseRadiusY: ev.value === 'ellipse' ? (currentD.path.ellipseRadiusY ?? 150) : undefined,
              polygonSides: ev.value === 'polygon' ? (currentD.path.polygonSides ?? 6) : undefined,
              polygonRadius: ev.value === 'polygon' ? (currentD.path.polygonRadius ?? 200) : undefined,
              arcStartAngle: ev.value === 'arc' ? (currentD.path.arcStartAngle ?? 0) : undefined,
              arcEndAngle: ev.value === 'arc' ? (currentD.path.arcEndAngle ?? 180) : undefined,
              arcRadius: ev.value === 'arc' ? (currentD.path.arcRadius ?? 200) : undefined,
            },
          } as Distribution,
        });
      }
    });

  // Instances count input
  pathFolder
    .addBinding(params, 'instances', {
      min: 0,
      max: 2000,
      step: 1,
      label: 'Instances',
    })
    .on('change', (ev: { value: number }) => {
      const currentState = getState();
      if (currentState.distribution.mode === 'path') {
        const currentD = currentState.distribution;
        update({
          distribution: {
            ...currentD,
            path: { 
              ...currentD.path, 
              instances: Math.max(0, Math.floor(ev.value)),
              frequency: currentD.path.frequency ?? 1.0,
              amplitude: currentD.path.amplitude ?? 50
            },
          } as Distribution,
        });
      }
    });

  // Sine controls (always created, shown/hidden based on path type)
  const sineFolder = pathFolder.addFolder({ title: 'Sine Controls', expanded: params.pathType === 'sine' });
  
  sineFolder.addBinding(params, 'frequency', {
    min: 0.1,
    max: 5.0,
    step: 0.1,
    label: 'Frequency',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { 
            ...currentD.path, 
            frequency: ev.value,
            amplitude: currentD.path.amplitude ?? 50 
          },
        } as Distribution,
      });
    }
  });

  sineFolder.addBinding(params, 'amplitude', {
    min: 10,
    max: 200,
    step: 10,
    label: 'Amplitude',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { 
            ...currentD.path, 
            amplitude: ev.value,
            frequency: currentD.path.frequency ?? 1.0 
          },
        } as Distribution,
      });
    }
  });

  // Bezier controls (always created, shown/hidden based on path type)
  const bezierFolder = pathFolder.addFolder({ title: 'Bezier Controls', expanded: params.pathType === 'bezier' });
  
  // For now, Bezier uses default control points
  // Future: Add UI for editing control points
  bezierFolder.addBinding({ info: 'Using default control points' }, 'info', {
    label: 'Info',
  });

  // Parametric controls (always created, shown/hidden based on path type)
  const parametricFolder = pathFolder.addFolder({ title: 'Parametric Controls', expanded: params.pathType === 'parametric' });
  
  // Parametric equation for X
  parametricFolder.addBinding({
    parametricX: params.pathType === 'parametric' && getState().distribution.mode === 'path' 
      ? (getState().distribution.path.parametricX ?? 't * 600 - 300')
      : 't * 600 - 300',
  }, 'parametricX', {
    label: 'X Equation',
  }).on('change', (ev: { value: string }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path' && currentState.distribution.path.type === 'parametric') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { 
            ...currentD.path, 
            parametricX: ev.value,
          },
        } as Distribution,
      });
    }
  });

  // Parametric equation for Y
  parametricFolder.addBinding({
    parametricY: params.pathType === 'parametric' && getState().distribution.mode === 'path' 
      ? (getState().distribution.path.parametricY ?? 'Math.sin(t * 2 * Math.PI * frequency) * 50')
      : 'Math.sin(t * 2 * Math.PI * frequency) * 50',
  }, 'parametricY', {
    label: 'Y Equation',
  }).on('change', (ev: { value: string }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path' && currentState.distribution.path.type === 'parametric') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { 
            ...currentD.path, 
            parametricY: ev.value,
          },
        } as Distribution,
      });
    }
  });

  // Spiral controls (always created, shown/hidden based on path type)
  const spiralFolder = pathFolder.addFolder({ title: 'Spiral Controls', expanded: params.pathType === 'spiral' });
  
  spiralFolder.addBinding({
    turns: params.pathType === 'spiral' && getState().distribution.mode === 'path' 
      ? (getState().distribution.path.spiralTurns ?? 3)
      : 3,
  }, 'turns', {
    min: 1,
    max: 10,
    step: 0.5,
    label: 'Turns',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path' && currentState.distribution.path.type === 'spiral') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { ...currentD.path, spiralTurns: ev.value },
        } as Distribution,
      });
    }
  });

  spiralFolder.addBinding({
    radius: params.pathType === 'spiral' && getState().distribution.mode === 'path' 
      ? (getState().distribution.path.spiralRadius ?? 200)
      : 200,
  }, 'radius', {
    min: 50,
    max: 400,
    step: 10,
    label: 'Radius',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path' && currentState.distribution.path.type === 'spiral') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { ...currentD.path, spiralRadius: ev.value },
        } as Distribution,
      });
    }
  });

  // Ellipse controls (always created, shown/hidden based on path type)
  const ellipseFolder = pathFolder.addFolder({ title: 'Ellipse Controls', expanded: params.pathType === 'ellipse' });
  
  ellipseFolder.addBinding({
    radiusX: params.pathType === 'ellipse' && getState().distribution.mode === 'path' 
      ? (getState().distribution.path.ellipseRadiusX ?? 250)
      : 250,
  }, 'radiusX', {
    min: 50,
    max: 400,
    step: 10,
    label: 'Radius X',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path' && currentState.distribution.path.type === 'ellipse') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { ...currentD.path, ellipseRadiusX: ev.value },
        } as Distribution,
      });
    }
  });

  ellipseFolder.addBinding({
    radiusY: params.pathType === 'ellipse' && getState().distribution.mode === 'path' 
      ? (getState().distribution.path.ellipseRadiusY ?? 150)
      : 150,
  }, 'radiusY', {
    min: 50,
    max: 400,
    step: 10,
    label: 'Radius Y',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path' && currentState.distribution.path.type === 'ellipse') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { ...currentD.path, ellipseRadiusY: ev.value },
        } as Distribution,
      });
    }
  });

  // Polygon controls (always created, shown/hidden based on path type)
  const polygonFolder = pathFolder.addFolder({ title: 'Polygon Controls', expanded: params.pathType === 'polygon' });
  
  polygonFolder.addBinding({
    sides: params.pathType === 'polygon' && getState().distribution.mode === 'path' 
      ? (getState().distribution.path.polygonSides ?? 6)
      : 6,
  }, 'sides', {
    min: 3,
    max: 12,
    step: 1,
    label: 'Sides',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path' && currentState.distribution.path.type === 'polygon') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { ...currentD.path, polygonSides: ev.value },
        } as Distribution,
      });
    }
  });

  polygonFolder.addBinding({
    radius: params.pathType === 'polygon' && getState().distribution.mode === 'path' 
      ? (getState().distribution.path.polygonRadius ?? 200)
      : 200,
  }, 'radius', {
    min: 50,
    max: 400,
    step: 10,
    label: 'Radius',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path' && currentState.distribution.path.type === 'polygon') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { ...currentD.path, polygonRadius: ev.value },
        } as Distribution,
      });
    }
  });

  // Arc controls (always created, shown/hidden based on path type)
  const arcFolder = pathFolder.addFolder({ title: 'Arc Controls', expanded: params.pathType === 'arc' });
  
  arcFolder.addBinding({
    startAngle: params.pathType === 'arc' && getState().distribution.mode === 'path' 
      ? (getState().distribution.path.arcStartAngle ?? 0)
      : 0,
  }, 'startAngle', {
    min: 0,
    max: 360,
    step: 5,
    label: 'Start Angle',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path' && currentState.distribution.path.type === 'arc') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { ...currentD.path, arcStartAngle: ev.value },
        } as Distribution,
      });
    }
  });

  arcFolder.addBinding({
    endAngle: params.pathType === 'arc' && getState().distribution.mode === 'path' 
      ? (getState().distribution.path.arcEndAngle ?? 180)
      : 180,
  }, 'endAngle', {
    min: 0,
    max: 360,
    step: 5,
    label: 'End Angle',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path' && currentState.distribution.path.type === 'arc') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { ...currentD.path, arcEndAngle: ev.value },
        } as Distribution,
      });
    }
  });

  arcFolder.addBinding({
    radius: params.pathType === 'arc' && getState().distribution.mode === 'path' 
      ? (getState().distribution.path.arcRadius ?? 200)
      : 200,
  }, 'radius', {
    min: 50,
    max: 400,
    step: 10,
    label: 'Radius',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'path' && currentState.distribution.path.type === 'arc') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          path: { ...currentD.path, arcRadius: ev.value },
        } as Distribution,
      });
    }
  });

  // Spacing function dropdown
  pathFolder
    .addBlade({
      view: 'list',
      label: 'Spacing',
      options: [
        { text: 'Linear', value: 'linear' },
        { text: 'Ease In', value: 'ease-in' },
        { text: 'Ease Out', value: 'ease-out' },
      ],
      value: params.spacing,
    })
    .on('change', (ev: { value: SpacingFn }) => {
      const currentState = getState();
      if (currentState.distribution.mode === 'path') {
        const currentD = currentState.distribution;
        update({
          distribution: {
            ...currentD,
            spacing: ev.value,
          } as Distribution,
        });
      }
    });

  // Particle controls folder
  const particleFolder = pane.addFolder({ title: 'Particle Controls', expanded: params.mode === 'particle' });

  // Particle type dropdown
  particleFolder
    .addBlade({
      view: 'list',
      label: 'Particle Type',
      options: [
        { text: 'Grid', value: 'grid' },
        { text: 'Random', value: 'random' },
      ],
      value: params.particleType,
    })
    .on('change', (ev: { value: 'grid' | 'random' }) => {
      const currentState = getState();
      if (currentState.distribution.mode === 'particle') {
        update({
          distribution: {
            mode: 'particle',
            particle: ev.value === 'grid' 
              ? { type: 'grid', density: 20, jitter: 0.3 }
              : { type: 'random', density: 20 },
          } as Distribution,
        });
      }
    });

  // Grid controls (always created, shown/hidden based on particle type)
  const gridFolder = particleFolder.addFolder({ title: 'Grid Controls', expanded: params.particleType === 'grid' });

  gridFolder.addBinding(params, 'density', {
    min: 1,
    max: 100,
    step: 1,
    label: 'Density',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'particle' && currentState.distribution.particle.type === 'grid') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          particle: { ...currentD.particle, density: ev.value },
        } as Distribution,
      });
    }
  });

  gridFolder.addBinding(params, 'jitter', {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Jitter',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'particle' && currentState.distribution.particle.type === 'grid') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          particle: { ...currentD.particle, jitter: ev.value },
        } as Distribution,
      });
    }
  });

  // Random controls (always created, shown/hidden based on particle type)
  const randomFolder = particleFolder.addFolder({ title: 'Random Controls', expanded: params.particleType === 'random' });

  randomFolder.addBinding(params, 'density', {
    min: 1,
    max: 100,
    step: 1,
    label: 'Density',
  }).on('change', (ev: { value: number }) => {
    const currentState = getState();
    if (currentState.distribution.mode === 'particle' && currentState.distribution.particle.type === 'random') {
      const currentD = currentState.distribution;
      update({
        distribution: {
          ...currentD,
          particle: { ...currentD.particle, density: ev.value },
        } as Distribution,
      });
    }
  });

  // Hide/show folders based on current mode and types
  if (params.mode !== 'path') {
    pathFolder.hidden = true;
  }
  if (params.mode !== 'particle') {
    particleFolder.hidden = true;
  }
  if (params.pathType !== 'sine') {
    sineFolder.hidden = true;
  }
  if (params.pathType !== 'bezier') {
    bezierFolder.hidden = true;
  }
  if (params.pathType !== 'parametric') {
    parametricFolder.hidden = true;
  }
  if (params.pathType !== 'spiral') {
    spiralFolder.hidden = true;
  }
  if (params.pathType !== 'ellipse') {
    ellipseFolder.hidden = true;
  }
  if (params.pathType !== 'polygon') {
    polygonFolder.hidden = true;
  }
  if (params.pathType !== 'arc') {
    arcFolder.hidden = true;
  }
  if (params.particleType !== 'grid') {
    gridFolder.hidden = true;
  }
  if (params.particleType !== 'random') {
    randomFolder.hidden = true;
  }

  // Subscribe to external state changes
  const unsub = subscribe((scene) => {
    const newD = scene.distribution;
    // Sync seed value
    if (scene.rng.seed !== params.seed) {
      params.seed = scene.rng.seed;
    }
    
    // Update mode and show/hide folders
    if (newD.mode !== params.mode) {
      params.mode = newD.mode;
      pathFolder.hidden = params.mode !== 'path';
      particleFolder.hidden = params.mode !== 'particle';
      if (params.mode === 'path') {
        pathFolder.expanded = true;
      } else {
        particleFolder.expanded = true;
      }
    }
    
    // Update path-specific params
    if (newD.mode === 'path') {
      if (newD.path.type !== params.pathType) {
        params.pathType = newD.path.type;
        sineFolder.hidden = params.pathType !== 'sine';
        bezierFolder.hidden = params.pathType !== 'bezier';
        parametricFolder.hidden = params.pathType !== 'parametric';
        spiralFolder.hidden = params.pathType !== 'spiral';
        ellipseFolder.hidden = params.pathType !== 'ellipse';
        polygonFolder.hidden = params.pathType !== 'polygon';
        arcFolder.hidden = params.pathType !== 'arc';
        if (params.pathType === 'sine') {
          sineFolder.expanded = true;
        } else if (params.pathType === 'bezier') {
          bezierFolder.expanded = true;
        } else if (params.pathType === 'parametric') {
          parametricFolder.expanded = true;
        } else if (params.pathType === 'spiral') {
          spiralFolder.expanded = true;
        } else if (params.pathType === 'ellipse') {
          ellipseFolder.expanded = true;
        } else if (params.pathType === 'polygon') {
          polygonFolder.expanded = true;
        } else if (params.pathType === 'arc') {
          arcFolder.expanded = true;
        }
      }
      params.instances = newD.path.instances;
      params.spacing = newD.spacing;
      if (newD.path.frequency !== undefined) {
        params.frequency = newD.path.frequency;
      }
      if (newD.path.amplitude !== undefined) {
        params.amplitude = newD.path.amplitude;
      }
    }
    
    // Update particle-specific params
    if (newD.mode === 'particle') {
      if (newD.particle.type !== params.particleType) {
        params.particleType = newD.particle.type;
        gridFolder.hidden = params.particleType !== 'grid';
        randomFolder.hidden = params.particleType !== 'random';
        if (params.particleType === 'grid') {
          gridFolder.expanded = true;
        } else if (params.particleType === 'random') {
          randomFolder.expanded = true;
        }
      }
      params.density = newD.particle.density;
      if (newD.particle.type === 'grid') {
        params.jitter = newD.particle.jitter;
      }
    }
  });

  // Return cleanup function
  return () => {
    unsub();
    pane.dispose();
  };
}