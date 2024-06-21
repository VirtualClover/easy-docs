import {
  AuthorUser,
  BASE_COMPONENT_DATA,
  BASE_FILE_DATA,
  BaseComponentData,
  BaseFileData,
  DEFAULT_SETTINGS,
} from '../constants/constants';
import { FIGMA_COMPONENT_DATA_KEY, FIGMA_NAMESPACE } from '../constants';

import { getUserDetailsInFigma } from './getUserDetailsFigma';
import { initComponents } from './components/initComponents';
import { objectIsNull } from '../objectisNull';

/**
 * The initialization func of the plugin
 */
export async function pluginInit() {
  let stringComponentData = figma.root.getSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_COMPONENT_DATA_KEY
  );
  let userData: AuthorUser = getUserDetailsInFigma();

  let componentData: BaseComponentData = stringComponentData
    ? JSON.parse(stringComponentData)
    : BASE_COMPONENT_DATA;
  //console.log(componentData);
  //Check if object exists
  if (objectIsNull(componentData)) {
    initComponents(componentData);
  } else {
    //Check if the components have not been deleted
    for (const key in componentData) {
      if (componentData.hasOwnProperty(key)) {
        let currentNode: BaseNode;
        await figma.getNodeByIdAsync(componentData[key].id).then((node) => {
          currentNode = node;
          if (
            !currentNode ||
            (currentNode.type != 'PAGE' && !currentNode.parent)
          ) {
            initComponents(componentData, false);
            //console.log('Component missing: ' + key);
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
