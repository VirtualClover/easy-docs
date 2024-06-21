import { DocData, PluginSettings } from '../constants/constants';
import { generateJSONFromFigmaContent } from '../docs/generateJSONFromFigmaContent';
import { reconcileDocData } from '../docs/reconcileData';

/**
 * Generates doc data from a section and then pushes it
 * @returns
 */
export async function pushFigmaUpdates(context): Promise<{
  type: string;
  data: any;
  selectedFrame: number;
}> {
  let selectedFrame: number = 0;
  let selection = figma.currentPage.selection[0];
  let parentSection: SectionNode;
  let parentFrame: FrameNode;
  if (selection) {
    switch (selection.type) {
      case 'SECTION':
        parentSection = selection;
        break;
      case 'FRAME':
        await inspectFrame(selection).then((res) => {
          parentSection = res.section;
          parentFrame = res.frame as FrameNode;
        });
        break;
      case 'INSTANCE':
        await inspectFrame(selection).then((res) => {
          parentSection = res.section;
          parentFrame = res.frame as FrameNode;
        });
        break;
      case 'TEXT':
        await inspectFrame(selection).then((res) => {
          parentSection = res.section;
          parentFrame = res.frame as FrameNode;
        });
        break;
      default:
        return { type: 'no-node', data: '', selectedFrame };
        break;
    }

    if (parentSection && parentSection.children.length) {
      let generatedDoc: DocData;
      await generateJSONFromFigmaContent(parentSection, context.settings).then(
        (data) => (generatedDoc = data)
      );
      //console.log('Generated doc');
      //console.log(generatedDoc);

      if (parentFrame) {
        selectedFrame = parentSection.children
          .map((node) => node.id)
          .indexOf(parentFrame.id);
      }

      if (generatedDoc.pages) {
        let reconciliation = reconcileDocData(
          generatedDoc,
          context.lastFetchDoc
        );

        if (reconciliation.changesNumber) {
          context.lastFetchDoc = <DocData>reconciliation.data;
          return {
            type: 'new-node-data',
            data: context.lastFetchDoc,
            selectedFrame,
          };
        } else {
          return { type: 'same-node-data', data: '', selectedFrame };
        }
      }
    }
  }
  return { type: 'no-node', data: '', selectedFrame };
}

let inspectFrame = async (
  selection: BaseNode,
  loopLimit: number = 5
): Promise<{ section: SectionNode; frame: FrameNode | InstanceNode }> => {
  let currentParent = selection.parent;
  while (
    loopLimit > 0 &&
    (currentParent.type === 'FRAME' || currentParent.type == 'INSTANCE')
  ) {
    selection = currentParent;
    currentParent = currentParent.parent;
    loopLimit--;
  }

  if (currentParent.type == 'SECTION' && selection.type === 'FRAME') {
    return {
      section: currentParent,
      frame: selection,
    };
  } else return { section: null, frame: null };
};
