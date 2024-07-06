import { DocData, PluginData } from '../constants/constants';

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
  if (!pluginContext.incomingFigmaChanges) {
    formatDocData(newData, 'editor', pluginContext.currentUser);
    pluginContext.setCurrentDocData(newData);
    console.log('set editor changes true');

    pluginContext.setIncomingEditorChanges(true);
    console.log('pushed to figma');
    console.log(newData);

    parent.postMessage(
      {
        pluginMessage: {
          type: 'update-selected-doc',
          data: newData,
          editedFrames: [editedFrame] ?? [],
        },
      },
      '*'
    );
  }
};
