import { AuthorUser, BaseComponentData, PluginSettings } from '../constants';

import { getComponentData } from './getComponentData';
import { getUserDetailsInFigma } from './getUserDetailsFigma';
import { handleFigmaError } from './handleFigmaError';
import { initComponents } from './components/initComponents';
import { initPluginSettings } from './getPluginSettings';
import { objectIsNull } from '../general/objectisNull';

/**
 * The initialization func of the plugin
 */
export async function pluginInit() {
  let userData: AuthorUser = getUserDetailsInFigma();
  let componentData: BaseComponentData = getComponentData();
  let pluginSettings: PluginSettings = initPluginSettings();
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
              initComponents(componentData, false).catch((e) =>
                handleFigmaError(
                  `There was an error generating the components`,
                  'ED-F0002',
                  e
                )
              );
            }
          });
        break;
      }
    }
  }

  figma.ui.postMessage({
    type: 'data-loaded',
    data: { settings: pluginSettings, user: userData },
  });
}
