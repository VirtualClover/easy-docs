import { generateSpecs } from './getSpecsFromInstance';
import { getCurrentSectionFromChildNode } from './getCurrentSectionFromChildNode';

export let scanCurrentSelectionForDocs = async (
  selectedFrame: number = 0
): Promise<{
  section: SectionNode | null;
  frame: FrameNode | null;
  selectedFrame: number;
}> => {
  let selection = figma.currentPage.selection[0];
  let parentSection: SectionNode = null;
  let parentFrame: FrameNode = null;
  if (selection) {
    switch (selection.type) {
      case 'SECTION':
        parentSection = selection;
        let childNodes = parentSection.children;
        if (childNodes.length && childNodes.length >= selectedFrame) {
          while (childNodes[selectedFrame].type != 'FRAME') {
            selectedFrame++;
          }
          parentFrame = childNodes[selectedFrame] as FrameNode;
        }
        break;
      case 'FRAME':
        await getCurrentSectionFromChildNode(selection).then((res) => {
          parentSection = res.section;
          parentFrame = res.frame as FrameNode;
          selectedFrame = res.frameIndex;
        });
        break;
      case 'INSTANCE':
        await getCurrentSectionFromChildNode(selection).then(async (res) => {
          await generateSpecs(selection as InstanceNode).then((res) =>
            console.log(res)
          );
          parentSection = res.section;
          parentFrame = res.frame as FrameNode;
          selectedFrame = res.frameIndex;
        });
        break;
      case 'TEXT':
        await getCurrentSectionFromChildNode(selection).then((res) => {
          parentSection = res.section;
          parentFrame = res.frame as FrameNode;
          selectedFrame = res.frameIndex;
        });
        break;
      default:
        break;
    }
  }

  return {
    section: parentSection,
    frame: parentFrame,
    selectedFrame,
  };
};
