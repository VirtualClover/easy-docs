import {
  BaseFileData,
  DEFAULT_SETTINGS,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants/constants';

import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../general/cleanseTextData';
import { generateBrokenLinkInstance } from './brokenLinkComponent.figma';
import {
  generateFigmaURL,
  getDetailsFromFigmaURL,
  validateFigmaURL,
} from '../../general/urlHandlers';
import { nodeSupportsChildren } from '../nodeSupportsChildren';
import { setNodeFills } from '../setNodeFills';
import { BlockData, DisplayFrameBlockData } from '../../constants';

export async function createDisplayFrameComponent(parent: FrameNode) {
  let component: ComponentNode;
  let captionProperty: string;
  let sourceProperty: string;
  await figma
    .loadFontAsync({ family: 'Inter', style: 'Medium Italic' })
    .then(() => {
      //Component
      component = figma.createComponent();
      component.resizeWithoutConstraints(100, 1);
      component.layoutMode = 'VERTICAL';
      component.primaryAxisSizingMode = 'AUTO';
      component.itemSpacing = 16;
      component.name = `${FIGMA_COMPONENT_PREFIX}Frame`;

      //Source
      let sourceWrapper = figma.createFrame();
      sourceWrapper.layoutMode = 'VERTICAL';
      sourceWrapper.verticalPadding = 8;
      sourceWrapper.paddingRight = 8;
      sourceWrapper.paddingLeft = 16;
      setNodeFills(
        sourceWrapper,
        DEFAULT_SETTINGS.customization.palette.status.neutral.muted
      );
      sourceWrapper.bottomLeftRadius = 16;
      sourceWrapper.bottomRightRadius = 16;
      component.appendChild(sourceWrapper);
      sourceWrapper.layoutSizingHorizontal = 'FILL';
      let sourceNode = figma.createText();
      sourceNode.fontName = { family: 'Inter', style: 'Medium Italic' };
      sourceNode.fontSize = 12;
      sourceNode.textDecoration = 'UNDERLINE';
      sourceNode.characters = 'Source here';
      setNodeFills(
        sourceNode,
        DEFAULT_SETTINGS.customization.palette.status.neutral.content
      );
      sourceWrapper.appendChild(sourceNode);
      sourceNode.layoutSizingHorizontal = 'FILL';
      sourceProperty = component.addComponentProperty(
        'url',
        'TEXT',
        'Source here'
      );
      sourceNode.componentPropertyReferences = { characters: sourceProperty };

      //caption
      let captionNode = figma.createText();
      captionNode.fontName = { family: 'Inter', style: 'Regular' };
      captionNode.fontSize = 16;
      captionNode.characters = 'Frame caption';
      setNodeFills(
        captionNode,
        DEFAULT_SETTINGS.customization.palette.onBackground.mid
      );
      component.appendChild(captionNode);
      captionNode.layoutSizingHorizontal = 'FILL';
      captionProperty = component.addComponentProperty(
        'caption',
        'TEXT',
        'Frame caption'
      );
      captionNode.componentPropertyReferences = { characters: captionProperty };
      parent.appendChild(component);
    });
  return {
    id: component.id,
    captionProp: captionProperty,
    sourceProp: sourceProperty,
  };
}

async function generateOuterWrapper(
  component: InstanceNode,
  nodeToDisplay?: FrameNode,
  brokenLinkCaption?: string
) {
  //Outer wrapper
  let outerWrapper = figma.createFrame();
  outerWrapper.layoutMode = 'VERTICAL';
  outerWrapper.counterAxisSizingMode = 'AUTO';
  outerWrapper.primaryAxisSizingMode = 'AUTO';
  outerWrapper.paddingBottom = 32;
  outerWrapper.itemSpacing = 0;
  outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}DosAndDonts`;

  //Display
  let displayFrame = figma.createFrame();
  displayFrame.layoutMode = 'VERTICAL';
  displayFrame.minHeight = 100;
  displayFrame.counterAxisSizingMode = 'AUTO';
  displayFrame.primaryAxisSizingMode = 'AUTO';
  displayFrame.counterAxisAlignItems = 'CENTER';
  displayFrame.primaryAxisAlignItems = 'CENTER';
  displayFrame.paddingBottom = 16;
  displayFrame.paddingTop = 16;
  displayFrame.paddingLeft = 16;
  displayFrame.paddingRight = 16;
  displayFrame.topLeftRadius = 16;
  displayFrame.topRightRadius = 16;
  setNodeFills(
    displayFrame,
    DEFAULT_SETTINGS.customization.palette.status.neutral.default
  );
  outerWrapper.appendChild(displayFrame);
  displayFrame.layoutSizingHorizontal = 'FILL';

  //Node to display
  if (nodeToDisplay) {
    let maxWidth: number = 1288 - 32;
    let maxHeight: number = 900;
    let scaleFactor = maxWidth / nodeToDisplay.width;
    // if frame is too long, then we resize so height doesnt surpass 900 so Figma can actually generate the preview
    let proposedHeight = nodeToDisplay.height * scaleFactor;
    if (proposedHeight > maxHeight) {
      scaleFactor = maxHeight / nodeToDisplay.height;
    }
    let bytes = await nodeToDisplay.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: scaleFactor },
    });
    let image = figma.createImage(bytes);
    let frame = figma.createFrame();
    frame.name = `[EASY-DOCS]displaying: ${nodeToDisplay.name}`;
    frame.x = maxWidth;
    frame.resize(
      nodeToDisplay.width * scaleFactor,
      nodeToDisplay.height * scaleFactor
    );
    frame.fills = [
      {
        imageHash: image.hash,
        scaleMode: 'FILL',
        scalingFactor: 1,
        type: 'IMAGE',
      },
    ];
    displayFrame.appendChild(frame);
  } else {
    await generateBrokenLinkInstance(brokenLinkCaption).then((n) =>
      displayFrame.appendChild(n)
    );
  }

  outerWrapper.appendChild(component);
  component.layoutSizingHorizontal = 'FILL';
  //component.layoutSizingHorizontal = 'FILL';
  return outerWrapper;
}

export async function generateDisplayFrameInstance(
  data: DisplayFrameBlockData
): Promise<FrameNode | null> {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let component: BaseNode;

  await figma
    .getNodeByIdAsync(componentData.displayFrame.id)
    .then((node) => {
      component = node;
    })
    .catch((e) => {
      console.error(e);
    });

  let sourceURL = generateFigmaURL(data.fileId, data.frameId, 'share');
  let referenceNode: BaseNode;
  await figma.getNodeByIdAsync(data.frameId).then((node) => {
    referenceNode = node;
  });

  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    let sourceWrapper = instance.children[0];
    if (nodeSupportsChildren(sourceWrapper)) {
      let sourceNode = sourceWrapper.children[0];
      if (sourceNode.type == 'TEXT' && referenceNode) {
        sourceNode.hyperlink = { type: 'URL', value: sourceURL };
      }
    }

    instance.setProperties({
      [componentData.displayFrame.captionProp]: decodeStringForFigma(
        data.caption
      ),
      [componentData.displayFrame.sourceProp]: sourceURL,
    });

    let nodeToDisplay: FrameNode;

    if (data.frameId) {
      if (referenceNode && referenceNode.type == 'FRAME') {
        nodeToDisplay = referenceNode;
      }
    }

    let outerWrapper = await generateOuterWrapper(
      instance,
      nodeToDisplay,
      'Frame not found'
    );

    return outerWrapper;
    //instance.set
  }
  return null;
}

export async function generateBlockDataFromDisplayFrame(
  instNode: InstanceNode,
  componentData: BaseFileData,
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  let blockType = 'displayFrame';
  let url =
    instNode.componentProperties[componentData.displayFrame.sourceProp].value ??
    '';
  let frameDetails;
  let frameExistsInFile: boolean | undefined = undefined;
  let blockData = {
    type: blockType,
    lastEdited,
    figmaNodeId,
    data: {
      frameId: '',
      fileId: '',
      frameExistsInFile,
      caption: encodeStringForHTML(
        instNode.componentProperties[componentData.displayFrame.captionProp]
          .value as string
      ),
    },
  };
  if (validateFigmaURL(url as string)) {
    frameDetails = getDetailsFromFigmaURL(<string>url, 'decode');

    await figma
      .getNodeByIdAsync(frameDetails.frameId)
      .then((node) => {
        frameExistsInFile = node != null ? true : false;
        blockData = {
          type: blockType,
          lastEdited,
          figmaNodeId,
          data: {
            frameId: frameDetails.frameId,
            fileId: frameDetails.fileId,
            frameExistsInFile,
            caption: encodeStringForHTML(
              instNode.componentProperties[
                componentData.displayFrame.captionProp
              ].value as string
            ),
          },
        };
      })
      .catch((e) => console.error(e));
  }
  return blockData;
}

export async function hydrateDisplayFrame(
  instance: InstanceNode,
  parentFrame: FrameNode,
  indexInFrame: number,
  componentData: BaseFileData
) {
  let block;
  await generateBlockDataFromDisplayFrame(
    instance,
    componentData,
    Date.now(),
    instance.id
  ).then((d: any) => {
    block = d;
    generateDisplayFrameInstance(block.data).then((n) => {
      parentFrame.insertChild(indexInFrame, n);
      n.layoutSizingHorizontal = 'FILL';
      let dehydratedNode = parentFrame.children[indexInFrame + 1];
      dehydratedNode.remove();
      block.data.figmaNodeId = n.id;
      block.data.frameExistsInFile = true;
    });
  });
  return block;
}
