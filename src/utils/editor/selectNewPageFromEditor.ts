import { PluginData } from '../constants';

export const selectNewPageFromEditor = (
  pageIndex: number,
  pluginContext: PluginData
) => {
  pluginContext.setLoadingState('MINOR');
  parent.postMessage(
    {
      pluginMessage: {
        type: 'select-node',
        id: pluginContext.currentDocData.pages[pageIndex].frameId,
      },
    },
    '*'
  );
};
