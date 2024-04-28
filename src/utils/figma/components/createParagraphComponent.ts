import { DEFAULT_SETTINGS, FIGMA_COMPONENT_PREFIX } from '../../constants';

import { setNodeFills } from '../setNodeFills';

export async function createParagraphComponent(parent: FrameNode) {
  let component: ComponentNode;
  let contentProperty: string;
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }).then(() => {
    component = figma.createComponent();
    component.resizeWithoutConstraints(400, 20);
    component.layoutMode = 'HORIZONTAL';
    component.counterAxisSizingMode = 'AUTO';
    component.primaryAxisSizingMode = 'FIXED';
    component.paddingBottom = 16;
    component.name = `${FIGMA_COMPONENT_PREFIX}Paragraph`;
    let textNode = figma.createText();
    textNode.fontName = { family: 'Inter', style: 'Regular' };
    textNode.fontSize = 24;
    textNode.characters = 'Paragraph';
    setNodeFills(textNode, DEFAULT_SETTINGS.palette.paragraph);
    component.appendChild(textNode);
    textNode.layoutSizingHorizontal = 'FILL';
    contentProperty = component.addComponentProperty(
      'content',
      'TEXT',
      'Paragraph'
    );
    textNode.componentPropertyReferences = { characters: contentProperty };
    parent.appendChild(component);
  });
  return { id: component.id, contentProp: contentProperty };
}
