import * as _ from 'lodash';

import {
  DEFAULT_SETTINGS,
  FIGMA_NAMESPACE,
  FIGMA_PLUGIN_SETTINGS_KEY,
  PluginSettings,
} from '../constants';

/**
 * Returns the plugin settings from the file storage, if there's none, it returns null
 * @returns
 */
export let getPluginSettings = (): PluginSettings | null => {
  let stringPluginSettings = figma.root.getSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_PLUGIN_SETTINGS_KEY
  );

  return stringPluginSettings ? JSON.parse(stringPluginSettings) : null;
};

/**
 * Sets the plugin settings in the file storage
 * @param settings
 */
export let setPluginSettings = (settings: PluginSettings) => {
  figma.root.setSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_PLUGIN_SETTINGS_KEY,
    JSON.stringify(settings)
  );
};

/**
 * Checks if plugin settings exists in the file storage and if not it sets them
 * @returns
 */
export let initPluginSettings = (): PluginSettings => {
  let pluginSettings = getPluginSettings();

  let mergedSettings: PluginSettings = pluginSettings
    ? _.merge(DEFAULT_SETTINGS, pluginSettings)
    : DEFAULT_SETTINGS;

  mergedSettings.customization = DEFAULT_SETTINGS.customization;

  setPluginSettings(mergedSettings);

  return mergedSettings;
};
