import { BASE_FILE_DATA, BaseFileData } from '../constants';

import { initComponents } from './components/initComponents';
import { nodeSupportsChildren } from './nodeSupportsChildren';
import { objectIsNotNull } from '../objectisNotNull';

function isInNode(parentID, nodeID) {
  let parentNode = figma.getNodeById(parentID);
  if (nodeSupportsChildren(parentNode)) {
    return parentNode.findOne((n) => n.id === nodeID);
  }
  return false;
}

export function pluginInit() {
  let stringData = figma.root.getSharedPluginData('EasyDocs', 'components');
  let componentData: BaseFileData = stringData
    ? JSON.parse(stringData)
    : BASE_FILE_DATA;
  console.log('Component data:' + componentData);
  //Check if object exists
  if (objectIsNotNull(componentData)) {
    initComponents(componentData);
  } else {
    //Check if the components have not been deleted
    for (const key in componentData) {
      if (componentData.hasOwnProperty(key)) {
        if (
          !figma.getNodeById(componentData[key]) ||
          !isInNode(componentData.componentFrameID, componentData[key])
        ) {
          initComponents(componentData, false);
          console.log('Component missing: ' + key);
          break;
        }
      }
    }
  }
  figma.ui.postMessage({ type: 'data-loaded' });
}
