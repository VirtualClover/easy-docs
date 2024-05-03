import { DEFAULT_SETTINGS, FIGMA_COMPONENT_PREFIX } from '../../constants';

import { setNodeFills } from '../setNodeFills';

export async function createDisplayFrameComponent(parent: FrameNode) {
  let component: ComponentNode;
  let captionProperty: string;
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }).then(() => {
    //Outer wrapper
    let outerWrapper = figma.createFrame();
    outerWrapper.layoutMode = 'HORIZONTAL';
    outerWrapper.counterAxisSizingMode = 'AUTO';
    outerWrapper.primaryAxisSizingMode = 'FIXED';
    outerWrapper.paddingBottom = 32;
    outerWrapper.itemSpacing = 16;
    outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}Frame`;

    //Display
    let displayFrame = figma.createFrame();
    displayFrame.layoutMode = 'VERTICAL';
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

    //Component
    component = figma.createComponent();
    component.resizeWithoutConstraints(1, 1);
    component.name = `${FIGMA_COMPONENT_PREFIX}Frame`;
    outerWrapper.appendChild(component);
    component.layoutSizingHorizontal = 'FILL';

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
  return { id: component.id, captionProp: captionProperty };
}
