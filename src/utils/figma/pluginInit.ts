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
    let stopLoop = false;
    for (const key in componentData.components) {
      if (componentData.components.hasOwnProperty(key)) {
        let currentNode: BaseNode;
        await figma
          .getNodeByIdAsync(componentData.components[key].id)
          .then(async (node) => {
            currentNode = node;
            if (
              !currentNode || !currentNode.parent
            ) {
              await initComponents(componentData, false).catch((e) =>
                handleFigmaError(
                 'F2',
                  e
                )
              );
              stopLoop = true;
            }
          });
          if (stopLoop){
            break;
          }
      }
    }
  }

  figma.ui.postMessage({
    type: 'data-loaded',
    data: { settings: pluginSettings, user: userData },
  });
}
