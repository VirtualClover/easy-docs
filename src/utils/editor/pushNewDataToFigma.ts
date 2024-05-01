import {
  DocData,
  EMPTY_AUTHOR_DATA,
  EMPTY_USER_AUTHOR_DATA,
  PluginData,
} from '../constants';

import { formatDocData } from '../docs/formatDocData';

export const pushNewDataToFigma = (
  pluginContext: PluginData,
  newData: DocData,
  editedFrame?: string
) => {
  formatDocData(newData, 'editor', pluginContext.currentUser);
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
