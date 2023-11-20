import { PageData } from '../constants';
import { generateHeaderInstance } from '../figma/components/generateHeaderInstance';
import { generateParagraphInstance } from '../figma/components/generateParagraphInstance';

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
