import {
  AuthorUser,
  BASE_COMPONENT_DATA,
  BaseComponentData,
  DEFAULT_SETTINGS,
  PluginSettings,
} from '../constants/constants';
import {
  FIGMA_NAMESPACE,
  FIGMA_PLUGIN_SETTINGS_KEY,
} from '../constants';

import { getComponentData } from './getComponentData';
import { getPluginSettings } from './getPluginSettings';
import { getUserDetailsInFigma } from './getUserDetailsFigma';
import { initComponents } from './components/initComponents';
import { objectIsNull } from '../objectisNull';

/**
 * The initialization func of the plugin
 */
export async function pluginInit() {
  let userData: AuthorUser = getUserDetailsInFigma();
  let componentData: BaseComponentData = getComponentData();
  let pluginSettings: PluginSettings = getPluginSettings();

  figma.root.setSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_PLUGIN_SETTINGS_KEY,
    JSON.stringify(pluginSettings)
  );
  //console.log(componentData);
  //Check if object exists
  if (objectIsNull(componentData)) {
    initComponents(componentData, true);
  } else {
    //Check if the components have not been deleted
    for (const key in componentData.components) {
      if (componentData.components.hasOwnProperty(key)) {
        let currentNode: BaseNode;
        await figma
          .getNodeByIdAsync(componentData.components[key].id)
          .then((node) => {
            currentNode = node;
            if (
              !currentNode ||
              (currentNode.type != 'PAGE' && !currentNode.parent)
            ) {
              initComponents(componentData, false);
            }
          });
        break;
      }
    }
  }

  figma.ui.postMessage({
    type: 'data-loaded',
    data: { settings: DEFAULT_SETTINGS, user: userData },
  });
}
