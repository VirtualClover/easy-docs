import {
  BaseComponentData,
  DEFAULT_GUIDELINES,
  FIGMA_COMPONENT_PREFIX,
  GuidelineType,
} from '../../constants/constants';
import { cautionIcon, doIcon, dontIcon } from '../../../assets/svgs';
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
import {
  BlockData,
  DosAndDontsBlockData,
  FIGMA_COMPONENT_DATA_KEY,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_NAMESPACE,
} from '../../constants';
import { ColorPalette, DEFAULT_FONT_FAMILIES } from '../../../styles/base';
import { getPluginSettings } from '../getPluginSettings';

function decideAssetsToDisplay(type: GuidelineType, palette: ColorPalette) {
  switch (type) {
    case 'do':
      return {
        palette: palette.status.success,
        icon: doIcon,
      };
      break;
    case 'dont':
      return {
        palette: palette.status.error,
        icon: dontIcon,
      };
      break;
    case 'caution':
      return {
        palette: palette.status.warning,
        icon: cautionIcon,
      };
      break;
    default:
      return {
        palette: palette.status.success,
        icon: doIcon,
      };
      break;
  }
}

export async function createDosAndDontsComponent(
  parent: FrameNode,
  guidelineTypes = DEFAULT_GUIDELINES
) {
  let set: ComponentNode[] = [];
  let componentSet: ComponentSetNode;
  let captionProperty: string;
  let sourceProperty: string;
  let guidelinePropKey: string = 'type';
  await figma
    .loadFontAsync({ family: DEFAULT_FONT_FAMILIES[0], style: 'Medium Italic' })
    .then(() => {
      let settings = getPluginSettings();
      for (let i = 0; i < guidelineTypes.length; i++) {
        const currentGuideline = guidelineTypes[i];
        let assets = decideAssetsToDisplay(
          currentGuideline,
          settings.customization.palette
        );
        let component = figma.createComponent();
        //Component
        component.resizeWithoutConstraints(100, 1);
        component.layoutMode = 'VERTICAL';
        component.primaryAxisSizingMode = 'AUTO';
        component.itemSpacing = 16;
        component.name = `${guidelinePropKey}=${currentGuideline}`;

        //Source
        let sourceWrapper = figma.createFrame();
        sourceWrapper.layoutMode = 'VERTICAL';
        sourceWrapper.verticalPadding = 8;
        sourceWrapper.paddingRight = 8;
        sourceWrapper.paddingLeft = 16;
        setNodeFills(sourceWrapper, assets.palette.muted);
        sourceWrapper.bottomLeftRadius = 16;
        sourceWrapper.bottomRightRadius = 16;
        sourceWrapper.name = 'urlWrapper';
        component.appendChild(sourceWrapper);
        sourceWrapper.layoutSizingHorizontal = 'FILL';
        let sourceNode = figma.createText();
        sourceNode.fontName = {
          family: DEFAULT_FONT_FAMILIES[0],
          style: 'Medium Italic',
        };
        sourceNode.fontSize = 12;
        sourceNode.textDecoration = 'UNDERLINE';
        sourceNode.characters = 'Source here';
        setNodeFills(sourceNode, assets.palette.content);
        sourceWrapper.appendChild(sourceNode);
        sourceNode.layoutSizingHorizontal = 'FILL';
        sourceProperty = component.addComponentProperty(
          'url',
          'TEXT',
          'Source here'
        );
        sourceNode.componentPropertyReferences = { characters: sourceProperty };

        //Caption wrapper
        let captionWrapper = figma.createFrame();
        captionWrapper.name = 'captionWrapper';
        captionWrapper.layoutMode = 'HORIZONTAL';
        component.appendChild(captionWrapper);
        captionWrapper.layoutSizingHorizontal = 'FILL';
        captionWrapper.counterAxisSizingMode = 'AUTO';
        captionWrapper.itemSpacing = 8;

        //Caption icon
        let captionIcon = figma.createNodeFromSvg(assets.icon);
        captionIcon.resize(22, 22);
        captionIcon.name = 'captionIcon';
        let shape = captionIcon.findOne((n) => n.type === 'VECTOR');
        setNodeFills(shape, assets.palette.content);
        captionWrapper.appendChild(captionIcon);

        //caption
        let captionNode = figma.createText();
        captionNode.fontName = {
          family: DEFAULT_FONT_FAMILIES[0],
          style: 'Regular',
        };
        captionNode.fontSize = 16;
        captionNode.characters = 'Frame caption';
        setNodeFills(
          captionNode,
          settings.customization.palette.onBackground.mid
        );
        captionWrapper.appendChild(captionNode);
        captionNode.layoutSizingHorizontal = 'FILL';
        captionProperty = component.addComponentProperty(
          'caption',
          'TEXT',
          'Frame caption'
        );
        captionNode.componentPropertyReferences = {
          characters: captionProperty,
        };
        parent.appendChild(component);
        set.push(component);
      }

      componentSet = figma.combineAsVariants(set, parent);
      componentSet.layoutMode = 'VERTICAL';
      componentSet.itemSpacing = 90;
      componentSet.name = `${FIGMA_COMPONENT_PREFIX}DosAndDonts`;
    });
  //console.log(componentSet.componentPropertyDefinitions);
  return {
    id: componentSet.id,
    sourceProp: Object.keys(componentSet.componentPropertyDefinitions)[0],
    captionProp: Object.keys(componentSet.componentPropertyDefinitions)[1],
    typeProp: {
      key: guidelinePropKey,
      variables:
        componentSet.componentPropertyDefinitions[guidelinePropKey]
          .variantOptions,
    },
  };
}

async function generateOuterWrapper(
  component: InstanceNode,
  type: GuidelineType,
  nodeToDisplay?: FrameNode,
  brokenLinkCaption?: string,
  brokenLinkComponentVersion?: number
) {
  let settings = getPluginSettings();
  //Outer wrapper
  let assets = decideAssetsToDisplay(type, settings.customization.palette);
  let outerWrapper = figma.createFrame();
  outerWrapper.layoutMode = 'VERTICAL';
  outerWrapper.counterAxisSizingMode = 'AUTO';
  outerWrapper.primaryAxisSizingMode = 'AUTO';
  outerWrapper.paddingBottom = 32;
  outerWrapper.itemSpacing = 0;
  outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}Frame`;

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
  setNodeFills(displayFrame, assets.palette.default);
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
    await generateBrokenLinkInstance(
      brokenLinkCaption,
      brokenLinkComponentVersion
    ).then((n) => displayFrame.appendChild(n));
  }

  outerWrapper.appendChild(component);
  component.layoutSizingHorizontal = 'FILL';
  //component.layoutSizingHorizontal = 'FILL';
  return outerWrapper;
}

export async function generateDosAndDontsInstance(
  data: DosAndDontsBlockData,
  componentVersion: number
): Promise<FrameNode | null> {
  let componentData: BaseComponentData = JSON.parse(
    figma.root.getSharedPluginData(FIGMA_NAMESPACE, FIGMA_COMPONENT_DATA_KEY)
  );
  let componentSet: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.components.dosAndDonts.id)
    .then((node) => {
      componentSet = node;
    })
    .catch((e) => {
      console.error(e);
    });

  let sourceURL = generateFigmaURL(data.fileId, data.frameId, 'share');
  let referenceNode: BaseNode;
  await figma.getNodeByIdAsync(data.frameId).then((node) => {
    referenceNode = node;
  });

  if (componentSet.type == 'COMPONENT_SET') {
    let component = componentSet.children[0] as ComponentNode;

    let instance = component.createInstance();

    let sourceWrapper = instance.children[0];
    if (nodeSupportsChildren(sourceWrapper)) {
      let sourceNode = sourceWrapper.children[0];
      if (sourceNode.type == 'TEXT' && referenceNode) {
        sourceNode.hyperlink = { type: 'URL', value: sourceURL };
      }
    }

    instance.setProperties({
      [componentData.components.dosAndDonts.sourceProp]: sourceURL,
      [componentData.components.dosAndDonts.captionProp]: decodeStringForFigma(
        data.caption
      ),
      [componentData.components.dosAndDonts.typeProp.key]: `${data.type}`,
    });

    instance.setSharedPluginData(
      FIGMA_NAMESPACE,
      FIGMA_COMPONENT_VERSION_KEY,
      componentVersion.toString()
    );

    let nodeToDisplay: FrameNode;

    if (data.frameId) {
      if (referenceNode && referenceNode.type == 'FRAME') {
        nodeToDisplay = referenceNode;
      }
    }

    let outerWrapper = await generateOuterWrapper(
      instance,
      data.type,
      nodeToDisplay,
      'Frame not found',
      componentVersion
    );

    return outerWrapper;
  }

  return null;
}

export async function generateBlockDataFromDosAndDonts(
  instNode: InstanceNode,
  componentData: BaseComponentData,
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  let url =
    instNode.componentProperties[
      componentData.components.dosAndDonts.sourceProp
    ].value ?? '';
  let frameDetails;
  let frameExistsInFile: boolean | undefined = undefined;
  let blockData = {
    type: 'dosAndDonts',
    lastEdited,
    figmaNodeId,
    data: {
      frameId: '',
      fileId: '',
      type: instNode.componentProperties[
        componentData.components.dosAndDonts.typeProp.key
      ].value,
      frameExistsInFile,
      caption: encodeStringForHTML(
        instNode.componentProperties[
          componentData.components.dosAndDonts.captionProp
        ].value as string
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
          type: 'dosAndDonts',
          lastEdited,
          figmaNodeId,
          data: {
            frameId: frameDetails.frameId,
            fileId: frameDetails.fileId,
            type: instNode.componentProperties[
              componentData.components.dosAndDonts.typeProp.key
            ].value,
            frameExistsInFile,
            caption: encodeStringForHTML(
              instNode.componentProperties[
                componentData.components.dosAndDonts.captionProp
              ].value as string
            ),
          },
        };
      })
      .catch((e) => console.error(e));
  }
  return blockData;
}

export async function hydrateDosAndDontsFrame(
  instance: InstanceNode,
  parentFrame: FrameNode,
  indexInFrame: number,
  componentData: BaseComponentData
) {
  let block;
  await generateBlockDataFromDosAndDonts(
    instance,
    componentData,
    Date.now(),
    instance.id
  ).then((d: any) => {
    block = d;
    generateDosAndDontsInstance(block.data, componentData.lastGenerated).then(
      (n) => {
        parentFrame.insertChild(indexInFrame, n);
        n.layoutSizingHorizontal = 'FILL';
        let dehydratedNode = parentFrame.children[indexInFrame + 1];
        dehydratedNode.remove();
        block.data.figmaNodeId = n.id;
        block.data.frameExistsInFile = true;
      }
    );
  });
  return block;
}
