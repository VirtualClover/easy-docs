import {
  BlockData,
  DEFAULT_SETTINGS,
  DocData,
  FIGMA_NAMESPACE,
  PageData,
} from '../constants';

import { createDocFrame } from '../figma/createDocFrame';
import { generateHeaderInstance } from '../figma/components/generateHeaderInstance';
import { generateParagraphInstance } from '../figma/components/generateParagraphInstance';

let lastEditedKey = 'lastEdited';

export function generateFigmaContentFromJSON(
  data: DocData,
  parentSection?: SectionNode
) {
  let pages = data.pages;
  let docTitle = data.title;

  parentSection.name = docTitle;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    let frame: FrameNode;
    if (page.frameId && parentSection.findOne((n) => n.id === page.frameId)) {
      frame = figma.getNodeById(page.frameId) as FrameNode;
    } else {
      frame = createDocFrame(DEFAULT_SETTINGS.frame, parentSection, page.title);
    }
    generatePageFrameFromJSON(page, frame);
  }
}

function generatePageFrameFromJSON(data: PageData, frame: FrameNode) {
  console.log('Gets here');

  let blocks = data.blocks;
  let totalLength =
    frame.children.length > blocks.length
      ? frame.children.length
      : blocks.length;
  for (let i = 0; i < totalLength; i++) {
    const block = blocks[i];
    let indexInFrame = frame.children.length - (i + 1);
    let figmaNode = frame.children[indexInFrame];
    if (figmaNode) {
      if (i + 1! > totalLength) {
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
          //figmaNode.remove();
          generateBlockInstanceFromJSON(block, frame, indexInFrame);
        }
      } else {
        //figmaNode.remove();
      }
    } else {
      generateBlockInstanceFromJSON(block, frame, indexInFrame);
    }
  }
}

function generateBlockInstanceFromJSON(
  block: BlockData,
  frame: FrameNode,
  indexInFrame: number
) {
  let node: InstanceNode;
  switch (block.type) {
    case 'header':
      node = generateHeaderInstance(block.data);
      break;
    case 'paragraph':
      node = generateParagraphInstance(block.data);
      break;
    default:
      break;
  }
  if (node) {
    if (indexInFrame < 0) {
      frame.appendChild(node);
    } else {
      frame.insertChild(indexInFrame, node);
    }
    node.setSharedPluginData(
      FIGMA_NAMESPACE,
      lastEditedKey,
      Date.now().toString()
    );
  }
}

/*
export function generateFigmaContentFromJSON(
  pageData: PageData,
  parent: FrameNode
) {
  let blocks = pageData.blocks;
  let content: InstanceNode[] = [];
  let node;

  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    switch (block.type) {
      case 'header':
        node = generateHeaderInstance(block.data);
        if (node) {
          content.push(node);
        }
        break;
      case 'paragraph':
        node = generateParagraphInstance(block.data);
        if (node) {
          content.push(node);
        }
        break;
      default:
        break;
    }
  }

  //console.log(content);
  for (let i = 0; i < content.length; i++) {
    let block = content[i];
    parent.appendChild(block);
    block.layoutSizingHorizontal = 'FILL';
  }
}


*/
