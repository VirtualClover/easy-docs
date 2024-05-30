import {
  DEFAULT_GUIDELINES,
  DEFAULT_SETTINGS,
  FIGMA_COMPONENT_PREFIX,
  GuidelineType,
} from '../../constants';
import { cautionIcon, doIcon, dontIcon } from '../../../assets/svgs';

import { BaseFileData } from '../../constants';
import { decodeStringForFigma } from '../../cleanseTextData';
import { generateBrokenLinkInstance } from './brokenLinkComponent.figma';
import { generateFigmaURL } from '../../general/urlHandlers';
import { nodeSupportsChildren } from '../nodeSupportsChildren';
import { setNodeFills } from '../setNodeFills';

function decideAssetsToDisplay(type: GuidelineType) {
  switch (type) {
    case 'do':
      return {
        palette: DEFAULT_SETTINGS.customization.palette.status.success,
        icon: doIcon,
      };
      break;
    case 'dont':
      return {
        palette: DEFAULT_SETTINGS.customization.palette.status.error,
        icon: dontIcon,
      };
      break;
    case 'caution':
      return {
        palette: DEFAULT_SETTINGS.customization.palette.status.warning,
        icon: cautionIcon,
      };
      break;
    default:
      return {
        palette: DEFAULT_SETTINGS.customization.palette.status.success,
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
    .loadFontAsync({ family: 'Inter', style: 'Medium Italic' })
    .then(() => {
      for (let i = 0; i < guidelineTypes.length; i++) {
        const currentGuideline = guidelineTypes[i];
        let assets = decideAssetsToDisplay(currentGuideline);
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
        sourceNode.fontName = { family: 'Inter', style: 'Medium Italic' };
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
        captionNode.fontName = { family: 'Inter', style: 'Regular' };
        captionNode.fontSize = 16;
        captionNode.characters = 'Frame caption';
        setNodeFills(
          captionNode,
          DEFAULT_SETTINGS.customization.palette.onBackground.mid
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
  brokenLinkCaption?: string
) {
  //Outer wrapper
  let assets = decideAssetsToDisplay(type);
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
    await generateBrokenLinkInstance(brokenLinkCaption).then((n) =>
      displayFrame.appendChild(n)
    );
  }

  outerWrapper.appendChild(component);
  component.layoutSizingHorizontal = 'FILL';
  //component.layoutSizingHorizontal = 'FILL';
  return outerWrapper;
}

export async function generateDosAndDontsInstance(
  data
): Promise<FrameNode | null> {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let componentSet: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.dosAndDonts.id)
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
      [componentData.dosAndDonts.sourceProp]: sourceURL,
      [componentData.dosAndDonts.captionProp]: decodeStringForFigma(
        data.caption
      ),
      [componentData.dosAndDonts.typeProp.key]: `${data.type}`,
    });

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
      'Frame not found'
    );

    return outerWrapper;
  }

  return null;
}
