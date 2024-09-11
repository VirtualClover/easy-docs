import { BlockData, DocData, PageData } from '../constants';
import { FIGMA_LAST_EDITED_KEY, FIGMA_NAMESPACE } from '../constants';

import { createPageFrame } from './createPageFrame';
import { decodeStringForFigma } from '../general/cleanseTextData';
import { generateAlertInstance } from './components/AlertComponent.figma';
import { generateCodeInstance } from './components/codeComponent.figma';
import { generateComponentDocInstance } from './components/componentDocComponent.figma';
import { generateDisplayFrameInstance } from './components/displayFrameComponent.figma';
import { generateDividerInstance } from './components/dividerComponent.figma';
import { generateDosAndDontsInstance } from './components/dosAndDontsComponent.figma';
import { generateHeaderInstance } from './components/headerComponent.figma';
import { generateListInstance } from './components/listComponent.figma';
import { generateParagraphInstance } from './components/paragraphComponent.figma';
import { generateQuoteInstance } from './components/quoteComponent.figma';
import { generateTableInstance } from './components/tableComponent.figma';
import { getComponentData } from './getComponentData';
import { getPluginSettings } from './getPluginSettings';
import { handleFigmaError } from './handleFigmaError';
import { resizeSection } from './resizeSection';
import { selectNode } from './selectNode';

/**
 * Generates Figma nodes based on doc data passed
 * @param data -The Document data
 * @param parentSection - The section where it should be generated in
 * @param editedFrames - The page that were edited compared to the current data
 * @returns
 */
export async function generateFigmaContentFromJSON(
  data: DocData,
  parentSection: SectionNode,
  editedFrames: string[] = [],
  reloadFrame: boolean = false
) {
  let pages = data.pages;
  let docTitle = decodeStringForFigma(data.title);
  let componentData = getComponentData();
  let settings = getPluginSettings();
  let componentVersion = componentData.lastGenerated;
  parentSection.name = docTitle;
  console.log('editor data');

  console.log(data);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    let frame: FrameNode;
    //console.log(page);

    if (
      (editedFrames && editedFrames.includes(page.frameId)) ||
      !editedFrames.length
    ) {
      if (
        page.frameId &&
        parentSection.findChild(
          (n) => n.id === page.frameId && n.type === 'FRAME'
        )
      ) {
        await figma
          .getNodeByIdAsync(page.frameId)
          .then(async (node) => {
            if (node.type === 'FRAME') {
              frame = node;
              await generateFrameDataFromJSON(
                page,
                frame,
                componentVersion,
                reloadFrame
              )
                .then(() => resizeSection(parentSection))
                .catch((e) => handleFigmaError('F7', e));
            }
          })
          .catch((e) => console.error(e));
      } else {
        frame = createPageFrame(parentSection, page.title, settings);
        frame.name = `New Page${Date.now().toString()}`; // This is here so the data doesn't match so figma can send the updated data with the frame id, otherwise when you create a page the frame id doesnt gets added to the page data sould be a better solution tbh
        selectNode(frame);
        await generateFrameDataFromJSON(
          page,
          frame,
          componentVersion,
          reloadFrame
        )
          .then(() => {
            resizeSection(parentSection);
          })
          .catch((e) => handleFigmaError('F8', e));
      }
    }
  }

  return parentSection;
}

/**
 * Generates a Page frame from page data
 * @param data - The page data
 * @param frame - The frame where it should be generated in
 * @param componentVersion -The current component version
 */
async function generateFrameDataFromJSON(
  data: PageData,
  frame: FrameNode,
  componentVersion: number,
  reloadFrame: boolean = false
) {
  selectNode(frame);
  console.log('opacity set!');

  frame.opacity = 0.5;
  if (frame.layoutMode != 'VERTICAL') {
    frame.layoutMode = 'VERTICAL';
  }
  let blocks = data.blocks;
  frame.name = decodeStringForFigma(data.title);
  let totalLength =
    frame.children.length > blocks.length
      ? frame.children.length
      : blocks.length;

  if (frame.children) {
    for (const child of frame.children) {
      child.remove();
    }
  }
  for (let i = 0; i < totalLength; i++) {
    const block = blocks[i];
    if (block) {
      await generateBlockInstanceFromJSON(
        block,
        frame,
        componentVersion,
        reloadFrame
      ).catch((e) => handleFigmaError('F10', e));
    }
  }
  frame.opacity = 1;
}

/**
 * Generates an instances from the plugin components depending on the type of block data it recieves
 * @param block -The block data
 * @param frame -The current page frame
 * @param indexInFrame -The index where the block is located in the page data
 * @param componentVersion - The current component version
 */
async function generateBlockInstanceFromJSON(
  block: BlockData,
  frame: FrameNode,
  componentVersion: number,
  reloadFrame: boolean = false
) {
  let node: InstanceNode | FrameNode;
  switch (block.type) {
    case 'header':
      await generateHeaderInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) => handleFigmaError('F11', e));
      break;
    case 'paragraph':
      await generateParagraphInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) => handleFigmaError('F12', e));
      break;
    case 'quote':
      await generateQuoteInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) => handleFigmaError('F13', e));
      break;
    case 'displayFrame':
      await generateDisplayFrameInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) => handleFigmaError('F14', e));
      break;
    case 'dosAndDonts':
      await generateDosAndDontsInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) => handleFigmaError('F15', e));
      break;
    case 'list':
      await generateListInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) => handleFigmaError('F16', e));
      break;
    case 'table':
      await generateTableInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) => handleFigmaError('F17', e));
      break;
    case 'alert':
      await generateAlertInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) => handleFigmaError('F18', e));
      break;
    case 'code':
      await generateCodeInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) => handleFigmaError('F19', e));
      break;
    case 'divider':
      await generateDividerInstance(componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) => handleFigmaError('F20', e));
      break;
    case 'componentDoc':
      await generateComponentDocInstance(
        block.data,
        componentVersion,
        null,
        reloadFrame
      )
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) => handleFigmaError('F21', e));
      break;
    //node = generateParagraphInstance(block.data);
    default:
      //node = generateParagraphInstance(DEFAULT_PAGE_DATA.blocks[0].data);
      break;
  }
  if (node) {
    frame.appendChild(node);
    node.layoutSizingHorizontal = 'FILL';
  }
  console.log('done generating block!');
}
