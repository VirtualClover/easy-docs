import {
  AuthorUser,
  BASE_FILE_DATA,
  BaseFileData,
  DEFAULT_SETTINGS,
} from '../constants';

import { getUserDetailsInFigma } from './getUserDetailsFigma';
import { initComponents } from './components/initComponents';
import { nodeSupportsChildren } from './nodeSupportsChildren';
import { objectIsNull } from '../objectisNull';

function isInNode(parentID, nodeID) {
  let parentNode = figma.getNodeById(parentID);
  if (nodeSupportsChildren(parentNode)) {
    return parentNode.findOne((n) => n.id === nodeID);
  }
  return false;
}

export function pluginInit() {
  let stringData = figma.root.getSharedPluginData('EasyDocs', 'components');
  let userData: AuthorUser = getUserDetailsInFigma();
  let componentData: BaseFileData = stringData
    ? JSON.parse(stringData)
    : BASE_FILE_DATA;
  //console.log(componentData);
  //Check if object exists
  if (objectIsNull(componentData)) {
    initComponents(componentData);
  } else {
    //Check if the components have not been deleted
    for (const key in componentData) {
      if (componentData.hasOwnProperty(key)) {
        let currentNode = figma.getNodeById(componentData[key].id);
        if (
          !currentNode ||
          (currentNode.type != 'PAGE' && !currentNode.parent)
        ) {
          initComponents(componentData, false);
          //console.log('Component missing: ' + key);
          break;
        }
      }
    }
  }
  figma.ui.postMessage({
    type: 'data-loaded',
    data: { settings: DEFAULT_SETTINGS, user: userData },
  });
}
