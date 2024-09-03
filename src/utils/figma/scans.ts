import {
  DocData,
  FigmaFileDocData,
  FigmaPageDocData,
} from '../constants';

import { generateJSONFromFigmaContent } from '../docs/generateJSONFromFigmaContent';
import { getComponentData } from './getComponentData';
import { getCurrentSectionFromChildNode } from './getCurrentSectionFromChildNode';

/**
 * Scans the current selection for documents
 * @param selectedFrame
 * @returns
 */
export let scanCurrentSelectionForDocs = async (
  selectedFrame: number = 0
): Promise<{
  section: SectionNode | null;
  frame: FrameNode | null;
  selectedFrame: number;
}> => {
let componentData = getComponentData();
  let selection = figma.currentPage.selection[0];
  let parentSection: SectionNode = null;
  let parentFrame: FrameNode = null;
  if (selection && figma.currentPage.id != componentData.components.componentsPage.id) {
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

/**
 * Scans a Figma page for documents
 * @param page
 * @returns
 */
export let scanWholePageForDocuments = async (
  page: PageNode
): Promise<FigmaPageDocData> => {
  let documents: DocData[] = [];
  for (const child of page.children) {
    if (child.type === 'SECTION') {
      if (child.children.length) {
        let generatedDoc: DocData;
        await generateJSONFromFigmaContent(child).then((res) => {
          if (res.docData.pages.length) {
            generatedDoc = res.docData;
            documents.push(generatedDoc);
          }
        });
      }
    }
  }
  return { title: page.name, data: documents, pageId:page.id };
};

/**
 * Scans a Figma file for documents
 * @param file
 * @returns
 */
export let scanWholeFileForDocuments = async (
  file: DocumentNode
): Promise<FigmaFileDocData> => {
  let fileData: FigmaFileDocData = { title: file.name, data: [] };
  await figma.loadAllPagesAsync().then(async () => {
    for (const page of file.children) {
      if (page.children.length) {
        await scanWholePageForDocuments(page).then((data) => {
          if (data.data.length) {
            fileData.data.push(data);
          }
        });
      }
    }
  });
  return fileData;
};

/**
 * Scans a frame to find instances
 * @param frame - The frame to scan
 * @param idsToExclude - The ids of the instances that should be ignored
 * @returns
 */
export let scanForInstancesInsideAFrame = (
  frame: FrameNode,
  idsToExclude: string[]
) => {
  let instInsideAFrame: InstanceNode = frame.findOne(
    (n) => n.type == 'INSTANCE' && !idsToExclude.includes(n.id)
  ) as InstanceNode;

  return instInsideAFrame;
};
