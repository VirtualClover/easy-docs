import * as _ from 'lodash';

import { DEFAULT_SETTINGS, PluginSettings } from '../constants/constants';
import { FIGMA_NAMESPACE, FIGMA_PLUGIN_SETTINGS_KEY } from '../constants';

/**
 * Returns the plugin settings from the file storage, if there's none, it returns the default settings
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

export let setPluginSettings = (settings: PluginSettings) => {
  figma.root.setSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_PLUGIN_SETTINGS_KEY,
    JSON.stringify(settings)
  );
};

export let initPluginSettings = (): PluginSettings => {
  let stringPluginSettings = figma.root.getSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_PLUGIN_SETTINGS_KEY
  );

  let pluginSettings = getPluginSettings();

  console.log(DEFAULT_SETTINGS);
  console.log(stringPluginSettings);
  //console.log(JSON.parse(stringPluginSettings));
  let mergedSettings = pluginSettings
    ? _.merge(DEFAULT_SETTINGS, pluginSettings)
    : DEFAULT_SETTINGS;

  setPluginSettings(mergedSettings);

  return mergedSettings;
};
