import {
  BlockData,
  DocData,
  PageData,
  PluginSettings,
} from '../constants/constants';
import {
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_LAST_EDITED_KEY,
  FIGMA_NAMESPACE,
} from '../constants';

import { createPageFrame } from '../figma/createPageFrame';
import { decodeStringForFigma } from '../general/cleanseTextData';
import { generateAlertInstance } from '../figma/components/AlertComponent.figma';
import { generateCodeInstance } from '../figma/components/codeComponent.figma';
import { generateComponentDocInstance } from '../figma/components/componentDocComponent.figma';
import { generateDisplayFrameInstance } from '../figma/components/displayFrameComponent.figma';
import { generateDividerInstance } from '../figma/components/dividerComponent.figma';
import { generateDosAndDontsInstance } from '../figma/components/dosAndDontsComponent.figma';
import { generateHeaderInstance } from '../figma/components/headerComponent.figma';
import { generateListInstance } from '../figma/components/listComponent.figma';
import { generateParagraphInstance } from '../figma/components/paragraphComponent.figma';
import { generateQuoteInstance } from '../figma/components/quoteComponent.figma';
import { generateTableInstance } from '../figma/components/tableComponent.figma';
import { getComponentData } from '../figma/getComponentData';
import { getPluginSettings } from '../figma/getPluginSettings';
import { handleFigmaError } from '../figma/handleFigmaError';
import { resizeSection } from '../figma/resizeSection';
import { selectNode } from '../figma/selectNode';

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
  editedFrames: string[] = []
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
              await generateFrameDataFromJSON(page, frame, componentVersion)
                .then(() => resizeSection(parentSection))
                .catch((e) =>
                  handleFigmaError(
                    `There was an error generating the frame data`,
                    'ED-F0007',
                    e
                  )
                );
            }
          })
          .catch((e) => console.error(e));
      } else {
        frame = createPageFrame(parentSection, page.title, settings);
        selectNode(frame);
        await generateFrameDataFromJSON(page, frame, componentVersion)
          .then(() => resizeSection(parentSection))
          .catch((e) =>
            handleFigmaError(
              `There was an error generating the frame data`,
              'ED-F0008',
              e
            )
          );
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
  componentVersion: number
) {
  selectNode(frame);
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

  for (let i = 0; i < totalLength; i++) {
    const block = blocks[i];
    let indexInFrame = i;
    let figmaNode = frame.children[indexInFrame];
    if (figmaNode) {
      if (i < blocks.length) {
        let nodeLastEdited = figmaNode.getSharedPluginData(
          FIGMA_NAMESPACE,
          FIGMA_LAST_EDITED_KEY
        )
          ? parseInt(
              figmaNode.getSharedPluginData(
                FIGMA_NAMESPACE,
                FIGMA_LAST_EDITED_KEY
              ),
              10
            )
          : 0;

        if (nodeLastEdited != block.lastEdited) {
          await generateBlockInstanceFromJSON(
            block,
            frame,
            indexInFrame,
            componentVersion
          )
            .then(() => figmaNode.remove())
            .catch((e) =>
              handleFigmaError(
                `There was an error generating an instance`,
                'ED-F0009',
                e
              )
            );
        }
      } else {
        figmaNode.remove();
      }
    } else {
      await generateBlockInstanceFromJSON(
        block,
        frame,
        indexInFrame,
        componentVersion
      ).catch((e) =>
        handleFigmaError(
          `There was an error generating an instance`,
          'ED-F0010',
          e
        )
      );
    }
  }
  frame.opacity = 1;
}

/**
 * Generates an isntances from the plugin components depending on the type of block data it recieves
 * @param block -The block data
 * @param frame -The current page frame
 * @param indexInFrame -The index where the block is located in the page data
 * @param componentVersion - The current component version
 */
async function generateBlockInstanceFromJSON(
  block: BlockData,
  frame: FrameNode,
  indexInFrame: number,
  componentVersion: number
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
        .catch((e) =>
          handleFigmaError(
            `There was an error generating a Header instance`,
            'ED-F0011',
            e
          )
        );
      break;
    case 'paragraph':
      await generateParagraphInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) =>
          handleFigmaError(
            `There was an error generating a Paragraph instance`,
            'ED-F0012',
            e
          )
        );
      break;
    case 'quote':
      await generateQuoteInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) =>
          handleFigmaError(
            `There was an error generating a Quote instance`,
            'ED-F0013',
            e
          )
        );
      break;
    case 'displayFrame':
      await generateDisplayFrameInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) =>
          handleFigmaError(
            `There was an error generating a Display Frame instance`,
            'ED-F0014',
            e
          )
        );
      break;
    case 'dosAndDonts':
      await generateDosAndDontsInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) =>
          handleFigmaError(
            `There was an error generating a Dos and dont's instance`,
            'ED-F0015',
            e
          )
        );
      break;
    case 'list':
      await generateListInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) =>
          handleFigmaError(
            `There was an error generating a List instance`,
            'ED-F0016',
            e
          )
        );
      break;
    case 'table':
      await generateTableInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) =>
          handleFigmaError(
            `There was an error generating a Table instance`,
            'ED-F0017',
            e
          )
        );
      break;
    case 'alert':
      await generateAlertInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) =>
          handleFigmaError(
            `There was an error generating an Alert instance`,
            'ED-F0018',
            e
          )
        );
      break;
    case 'code':
      await generateCodeInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) =>
          handleFigmaError(
            `There was an error generating a Code block instance`,
            'ED-F0019',
            e
          )
        );
      break;
    case 'divider':
      await generateDividerInstance(componentVersion)
        .then((n) => {
          if (n) {
            node = n;
          }
        })
        .catch((e) =>
          handleFigmaError(
            `There was an error generating a Divider instance`,
            'ED-F0020',
            e
          )
        );
      break;
    case 'componentDoc':
      await generateComponentDocInstance(block.data, componentVersion)
        .then((n) => {
          if (n) {
            console.log('node doc');
            console.log(n);

            node = n;
          }
        })
        .catch((e) =>
          handleFigmaError(
            `There was an error generating a Component Doc instance`,
            'ED-F0021',
            e
          )
        );
      break;
    //node = generateParagraphInstance(block.data);
    default:
      //node = generateParagraphInstance(DEFAULT_PAGE_DATA.blocks[0].data);
      break;
  }
  if (node) {
    frame.insertChild(indexInFrame, node);
    node.layoutSizingHorizontal = 'FILL';
  }
  console.log('done generating block!');
}
