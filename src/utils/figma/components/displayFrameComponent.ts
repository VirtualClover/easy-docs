import {
  BaseFileData,
  DEFAULT_SETTINGS,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants';
import {
  generateFigmaURL,
  getDetailsFromFigmaURL,
} from '../../docs/figmaURLHandlers';

import { nodeSupportsChildren } from '../nodeSupportsChildren';
import { setNodeFills } from '../setNodeFills';

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
      sourceWrapper.horizontalPadding = 8;
      setNodeFills(sourceWrapper, DEFAULT_SETTINGS.palette.divider);
      component.appendChild(sourceWrapper);
      sourceWrapper.layoutSizingHorizontal = 'FILL';
      let sourceNode = figma.createText();
      sourceNode.fontName = { family: 'Inter', style: 'Medium Italic' };
      sourceNode.fontSize = 12;
      sourceNode.characters = 'Source here';
      setNodeFills(sourceNode, DEFAULT_SETTINGS.palette.paragraph);
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
      setNodeFills(captionNode, DEFAULT_SETTINGS.palette.paragraph);
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

function generateOuterWrapper(
  component: InstanceNode,
  nodeToDisplay?: FrameNode
) {
  //Outer wrapper
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
  setNodeFills(displayFrame, DEFAULT_SETTINGS.palette.surface);
  outerWrapper.appendChild(displayFrame);
  displayFrame.layoutSizingHorizontal = 'FILL';

  //Node to display
  if (nodeToDisplay) {
    let duplicatedNode = nodeToDisplay.clone();
    displayFrame.appendChild(duplicatedNode);
  }

  outerWrapper.appendChild(component);
  component.layoutSizingHorizontal = 'FILL';
  //component.layoutSizingHorizontal = 'FILL';
  return outerWrapper;
}

export function generateDisplayFrameInstance(data): FrameNode {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let component = figma.getNodeById(componentData.displayFrame.id);
  let sourceURL = generateFigmaURL(data.fileId, data.frameId, 'share');

  if (nodeSupportsChildren(component)) {
    let sourceWrapper = component.children[0];
    if (nodeSupportsChildren(sourceWrapper)) {
      let sourceNode = sourceWrapper.children[0];
      if (sourceNode.type == 'TEXT') {
        sourceNode.hyperlink = { type: 'URL', value: sourceURL };
      }
    }
  }
  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.displayFrame.captionProp]: data.caption.replace(
        '&nbsp;',
        ' '
      ),
      [componentData.displayFrame.sourceProp]: sourceURL,
    });

    let nodeToDisplay;

    if (data.frameId) {
      console.log(data.frameId);

      let node = figma.getNodeById(data.frameId);
      if (node.type == 'FRAME') {
        nodeToDisplay = node;
      }
    }

    return generateOuterWrapper(instance, nodeToDisplay);
    //instance.set
  }
  return null;
}
