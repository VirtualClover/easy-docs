import {
  BlockData,
  DocData,
  FIGMA_NAMESPACE,
  PageData,
  PluginSettings,
} from '../constants';

import { createDocFrame } from '../figma/createDocFrame';
import { generateHeaderInstance } from '../figma/components/generateHeaderInstance';
import { generateParagraphInstance } from '../figma/components/generateParagraphInstance';
import { resizeSection } from '../figma/resizeSection';

let lastEditedKey = 'lastEdited';

export function generateFigmaContentFromJSON(
  data: DocData,
  parentSection: SectionNode,
  settings: PluginSettings
) {
  let pages = data.pages;
  let docTitle = data.title;
  //console.log('Gets at least here c:');
  parentSection.name = docTitle;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    let frame: FrameNode;
    //console.log(page);
    if (page.frameId && parentSection.findOne((n) => n.id === page.frameId)) {
      frame = figma.getNodeById(page.frameId) as FrameNode;
    } else {
      frame = createDocFrame(parentSection, page.title, settings);
    }
    generateFrameDataFromJSON(page, frame);
    resizeSection(parentSection);
  }
}

function generateFrameDataFromJSON(data: PageData, frame: FrameNode) {
  let blocks = data.blocks;
  frame.name = data.title;
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
          generateBlockInstanceFromJSON(block, frame, indexInFrame);
          figmaNode.remove();
        }
      } else {
        figmaNode.remove();
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
    case 'quote':
      console.log(block.data);
      //node = generateParagraphInstance(block.data);
      break;
    default:
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
