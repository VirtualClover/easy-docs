import { PluginData } from '../constants/constants';

export const selectNewPageFromEditor = (
  pageIndex: number,
  pluginContext: PluginData
) => {
  pluginContext.setLoadingState('MINOR');
  if (
    pluginContext.currentDocData.pages &&
    pluginContext.currentDocData.pages[pageIndex] &&
    pluginContext.currentDocData.pages[pageIndex].frameId
  ) {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'select-node',
          id: pluginContext.currentDocData.pages[pageIndex].frameId,
        },
      },
      '*'
    );
  } else {
    console.error('The selected pages does not exist.');
    
  }
};
