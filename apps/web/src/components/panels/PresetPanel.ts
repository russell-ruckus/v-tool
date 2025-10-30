/**
 * Preset Panel UI
 * Manages saving and loading presets
 */
import { Pane } from 'tweakpane';
import { getState, loadScene } from '../../store/store';
import {
  savePreset,
  loadPreset,
  listPresets,
  deletePreset,
  renamePreset,
} from '../../services/presets';
import type { Scene } from '@v-tool/shared';

export function PresetPanel(root: HTMLElement) {
  const pane = new Pane({
    container: root,
    title: 'Presets',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

  const params = {
    presetName: '',
    selectedPreset: '',
    status: '',
    renameNewName: '',
  };

  const saveFolder = pane.addFolder({ title: 'Save Preset', expanded: true });

  const nameBinding = saveFolder.addBinding(params, 'presetName', {
    label: 'Name',
  });

  const saveButton = saveFolder.addButton({ title: 'Save Preset' });
  
  // Disable save button initially (empty name)
  const updateSaveButtonState = () => {
    saveButton.disabled = !params.presetName.trim();
  };
  updateSaveButtonState();
  
  nameBinding.on('change', () => {
    updateSaveButtonState();
  });

  saveButton.on('click', () => {
    const name = params.presetName.trim();
    if (!name) {
      params.status = 'Error: Preset name cannot be empty';
      statusBinding.refresh();
      return;
    }

    try {
      const scene = getState();
      savePreset(name, scene);
      params.status = `Preset "${name}" saved successfully`;
      params.presetName = '';
      nameBinding.refresh();
      updateSaveButtonState();
      refreshPresetList();
    } catch (error) {
      params.status = error instanceof Error ? error.message : 'Failed to save preset';
    }
    statusBinding.refresh();
  });

  const loadFolder = pane.addFolder({ title: 'Load Preset', expanded: true });

  // Get initial preset list
  let presetOptions: Record<string, string> = {};
  const updatePresetOptions = () => {
    const presets = listPresets();
    presetOptions = {};
    if (presets.length === 0) {
      presetOptions['(No presets)'] = '';
    } else {
      presets.forEach((name) => {
        presetOptions[name] = name;
      });
    }
    params.selectedPreset = presets[0] || '';
  };
  updatePresetOptions();

  const presetBinding = loadFolder.addBinding(params, 'selectedPreset', {
    options: presetOptions,
    label: 'Preset',
  });

  const loadButton = loadFolder.addButton({ title: 'Load' });
  loadButton.on('click', () => {
    const name = params.selectedPreset;
    if (!name || name === '(No presets)') {
      params.status = 'Please select a preset';
      statusBinding.refresh();
      return;
    }

    const scene = loadPreset(name);
    if (!scene) {
      params.status = `Error: Preset "${name}" not found or corrupted`;
      statusBinding.refresh();
      return;
    }

    loadScene(scene);
    params.status = `Preset "${name}" loaded successfully`;
    statusBinding.refresh();
  });

  const manageFolder = pane.addFolder({ title: 'Manage', expanded: true });

  const renameBinding = manageFolder.addBinding(params, 'renameNewName', {
    label: 'Rename to',
  });

  const renameButton = manageFolder.addButton({ title: 'Rename' });
  renameButton.on('click', () => {
    const oldName = params.selectedPreset;
    const newName = params.renameNewName.trim();

    if (!oldName || oldName === '(No presets)') {
      params.status = 'Please select a preset to rename';
      statusBinding.refresh();
      return;
    }

    if (!newName) {
      params.status = 'New name cannot be empty';
      statusBinding.refresh();
      return;
    }

    if (oldName === newName) {
      params.status = 'New name is the same as current name';
      statusBinding.refresh();
      return;
    }

    try {
      const success = renamePreset(oldName, newName);
      if (success) {
        params.status = `Preset renamed from "${oldName}" to "${newName}"`;
        params.selectedPreset = newName;
        params.renameNewName = '';
        refreshPresetList();
      } else {
        params.status = `Error: Preset "${newName}" already exists`;
      }
    } catch (error) {
      params.status = error instanceof Error ? error.message : 'Failed to rename preset';
    }
    statusBinding.refresh();
    renameBinding.refresh();
    presetBinding.refresh();
  });

  const deleteButton = manageFolder.addButton({ title: 'Delete' });
  deleteButton.on('click', () => {
    const name = params.selectedPreset;
    if (!name || name === '(No presets)') {
      params.status = 'Please select a preset to delete';
      statusBinding.refresh();
      return;
    }

    try {
      deletePreset(name);
      params.status = `Preset "${name}" deleted successfully`;
      params.selectedPreset = '';
      params.renameNewName = '';
      refreshPresetList();
    } catch (error) {
      params.status = error instanceof Error ? error.message : 'Failed to delete preset';
    }
    statusBinding.refresh();
    presetBinding.refresh();
    renameBinding.refresh();
  });

  const statusFolder = pane.addFolder({ title: 'Status', expanded: false });
  const statusBinding = statusFolder.addBinding(params, 'status', {
    readonly: true,
    label: 'Status',
  });

  // Function to refresh preset list after operations
  function refreshPresetList(): void {
    updatePresetOptions();
    presetBinding.refresh();
    // If current selection no longer exists, reset to first available or empty
    if (!presetOptions[params.selectedPreset]) {
      const presets = listPresets();
      params.selectedPreset = presets.length > 0 ? presets[0] : '';
      presetBinding.refresh();
    }
  }

  // Return cleanup function
  return () => {
    pane.dispose();
  };
}

