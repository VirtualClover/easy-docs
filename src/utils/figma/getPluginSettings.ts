import * as _ from 'lodash';

import { DEFAULT_SETTINGS, PluginSettings } from '../constants/constants';
import { FIGMA_NAMESPACE, FIGMA_PLUGIN_SETTINGS_KEY } from '../constants';

/**
 * Returns the plugin settings from the file storage, if there's none, it returns null
 * @returns
 */
export let getPluginSettings = (): PluginSettings | null => {
  let stringPluginSettings = figma.root.getSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_PLUGIN_SETTINGS_KEY
  );

  //console.log(JSON.parse(stringPluginSettings));

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

  //console.log(JSON.parse(stringPluginSettings));
  let mergedSettings = pluginSettings
    ? _.merge(DEFAULT_SETTINGS, pluginSettings)
    : DEFAULT_SETTINGS;

  setPluginSettings(mergedSettings);

  return mergedSettings;
};
