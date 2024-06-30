import { DEFAULT_SETTINGS, PluginSettings } from '../constants/constants';
import { FIGMA_NAMESPACE, FIGMA_PLUGIN_SETTINGS_KEY } from '../constants';

/**
 * Returns the plugin settings from the file storage, if there's none, it returns the default settings
 * @returns 
 */
export let getPluginSettings = (): PluginSettings => {
  let stringPluginSettings = figma.root.getSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_PLUGIN_SETTINGS_KEY
  );

  return stringPluginSettings
    ? JSON.parse(stringPluginSettings)
    : DEFAULT_SETTINGS;
};
