import { DocData, PluginData } from '../constants';

export const pushNewDataToFigma = (
  pluginContext: PluginData,
  newData: DocData,
  editedFrame?: string
) => {
  newData.author = {
    platform: 'editor',
  };
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
