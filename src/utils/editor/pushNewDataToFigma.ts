import { DocData, PluginData } from '../constants';

import { formatDocData } from '../docs/formatDocData';

/**
 * Pushes editor data to Figma
 * @param pluginContext
 * @param newData
 * @param editedFrame
 */
export const pushNewDataToFigma = (
  pluginContext: PluginData,
  newData: DocData,
  editedFrame?: string
) => {
  formatDocData(newData, 'editor', pluginContext.currentUser);
  //console.log(newData);
  pluginContext.setCurrentDocData(newData);
  pluginContext.setIncomingEditorChanges(true);
  parent.postMessage(
    {
      pluginMessage: {
        type: 'update-selected-doc',
        data: newData,
        editedFrame: editedFrame ?? '',
      },
    },
    '*'
  );
};
