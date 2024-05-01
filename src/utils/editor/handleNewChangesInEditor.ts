import { clone } from '../clone';
import { DocData, PageData, PluginData, Reconciliation } from '../constants';
import { formatPageData } from '../docs/formatPageData';
import { pushNewDataToFigma } from './pushNewDataToFigma';

export const handleNewChangesInEditor = (
  pluginContext: PluginData,
  reconciliation?: Reconciliation,
  reconciliationType?: 'doc' | 'page'
) => {
  let tempDoc: DocData = clone(pluginContext.currentDocData);
  let editedFrame;

  if (reconciliation && reconciliation.changesNumber) {
    if ((reconciliationType = 'page')) {
      let page: PageData = <PageData>reconciliation.data;
      formatPageData(page);
      tempDoc.pages[pluginContext.activeTab] = page;
      editedFrame = page.frameId;
    }
  }
  pushNewDataToFigma(pluginContext, tempDoc, editedFrame);
};
