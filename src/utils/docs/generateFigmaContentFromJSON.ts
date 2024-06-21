import {
  BlockData,
  DocData,
  FIGMA_NAMESPACE,
  PageData,
  PluginSettings,
} from '../constants/constants';

import { createPageFrame } from '../figma/createPageFrame';
import { decodeStringForFigma } from '../general/cleanseTextData';
import { generateAlertInstance } from '../figma/components/AlertComponent.figma';
import { generateCodeInstance } from '../figma/components/codeComponent.figma';
import { generateDisplayFrameInstance } from '../figma/components/displayFrameComponent.figma';
import { generateDividerInstance } from '../figma/components/dividerComponent.figma';
import { generateDosAndDontsInstance } from '../figma/components/dosAndDontsComponent.figma';
import { generateHeaderInstance } from '../figma/components/headerComponent.figma';
import { generateListInstance } from '../figma/components/listComponent.figma';
import { generateParagraphInstance } from '../figma/components/paragraphComponent.figma';
import { generateQuoteInstance } from '../figma/components/quoteComponent.figma';
import { generateTableInstance } from '../figma/components/tableComponent.figma';
import { resizeSection } from '../figma/resizeSection';
import { selectNode } from '../figma/selectNode';

let lastEditedKey = 'lastEdited';

export async function generateFigmaContentFromJSON(
  data: DocData,
  parentSection: SectionNode,
  settings: PluginSettings
) {
  let pages = data.pages;
  let docTitle = decodeStringForFigma(data.title);
  parentSection.name = docTitle;
  console.log('editor data');
  console.log(data);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    let frame: FrameNode;
    //console.log(page);
    if (page.frameId && parentSection.findOne((n) => n.id === page.frameId)) {
      await figma
        .getNodeByIdAsync(page.frameId)
        .then(async (node) => {
          if (node.type === 'FRAME') {
            frame = node;
            await generateFrameDataFromJSON(page, frame).then(() =>
              resizeSection(parentSection)
            );
          }
        })
        .catch((e) => console.error(e));
    } else {
      frame = createPageFrame(parentSection, page.title, settings);
      selectNode(frame);
      await generateFrameDataFromJSON(page, frame).then(() =>
        resizeSection(parentSection)
      );
    }
  }

  return 'done!';
}

async function generateFrameDataFromJSON(data: PageData, frame: FrameNode) {
  if (frame.layoutMode != 'VERTICAL') {
    frame.layoutMode = 'VERTICAL';
  }
  let blocks = data.blocks;
  frame.name = decodeStringForFigma(data.title);
  let totalLength =
    frame.children.length > blocks.length
      ? frame.children.length
      : blocks.length;

  for (let i = 0; i < totalLength; i++) {
    const block = blocks[i];
    let indexInFrame = i;
    let figmaNode = frame.children[indexInFrame];
    if (figmaNode) {
      if (i < blocks.length) {
        let nodeLastEdited = figmaNode.getSharedPluginData(
          FIGMA_NAMESPACE,
          lastEditedKey
        )
          ? parseInt(
              figmaNode.getSharedPluginData(FIGMA_NAMESPACE, lastEditedKey),
              10
            )
          : 0;

        if (nodeLastEdited != block.lastEdited) {
          await generateBlockInstanceFromJSON(block, frame, indexInFrame).then(
            () => figmaNode.remove()
          );
        }
      } else {
        figmaNode.remove();
      }
    } else {
      await generateBlockInstanceFromJSON(block, frame, indexInFrame);
    }
  }
}

async function generateBlockInstanceFromJSON(
  block: BlockData,
  frame: FrameNode,
  indexInFrame: number
) {
  let node: InstanceNode | FrameNode;
  switch (block.type) {
    case 'header':
      await generateHeaderInstance(block.data).then((n) => {
        if (n) {
          node = n;
        }
      });
      break;
    case 'paragraph':
      await generateParagraphInstance(block.data).then((n) => {
        if (n) {
          node = n;
        }
      });
      break;
    case 'quote':
      await generateQuoteInstance(block.data).then((n) => {
        if (n) {
          node = n;
        }
      });
      //node = generateParagraphInstance(block.data);
      break;
    case 'displayFrame':
      await generateDisplayFrameInstance(block.data).then((n) => {
        if (n) {
          node = n;
        }
      });
      break;
    case 'dosAndDonts':
      await generateDosAndDontsInstance(block.data).then((n) => {
        if (n) {
          node = n;
        }
      });
      break;
    case 'list':
      await generateListInstance(block.data).then((n) => {
        if (n) {
          node = n;
        }
      });
      break;
    case 'table':
      await generateTableInstance(block.data).then((n) => {
        if (n) {
          node = n;
        }
      });
      break;
    case 'alert':
      await generateAlertInstance(block.data).then((n) => {
        if (n) {
          node = n;
        }
      });
      break;
    case 'code':
      await generateCodeInstance(block.data).then((n) => {
        if (n) {
          node = n;
        }
      });
      break;
    case 'divider':
      await generateDividerInstance().then((n) => {
        if (n) {
          node = n;
        }
      });
      break;
    //node = generateParagraphInstance(block.data);
    default:
      //node = generateParagraphInstance(DEFAULT_PAGE_DATA.blocks[0].data);
      break;
  }
  if (node) {
    frame.insertChild(indexInFrame, node);
    node.layoutSizingHorizontal = 'FILL';

    node.setSharedPluginData(
      FIGMA_NAMESPACE,
      lastEditedKey,
      block.lastEdited ? block.lastEdited.toString() : Date.now.toString()
    );
  }
}
