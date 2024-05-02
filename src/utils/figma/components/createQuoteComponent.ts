import { DEFAULT_SETTINGS, FIGMA_COMPONENT_PREFIX } from '../../constants';

import { clone } from '../../clone';
import { setNodeFills } from '../setNodeFills';

export async function createQuoteComponent(parent: FrameNode) {
  let component: ComponentNode;
  let contentProperty: string;
  let authorProperty: string;
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium Italic' }).then(() => {
    component = figma.createComponent();
    component.resizeWithoutConstraints(400, 20);
    component.layoutMode = 'HORIZONTAL';
    component.counterAxisSizingMode = 'AUTO';
    component.primaryAxisSizingMode = 'FIXED';
    component.paddingTop = 8;
    component.paddingBottom = 32;
    //Inner wrapper
    let innerWrapper = figma.createFrame();
    innerWrapper.resizeWithoutConstraints(400, 20);
    innerWrapper.layoutMode = 'VERTICAL';
    innerWrapper.primaryAxisSizingMode = 'AUTO';
    innerWrapper.strokeLeftWeight = 16;
    innerWrapper.paddingLeft = 32;
    innerWrapper.paddingRight = 16;
    innerWrapper.paddingTop = 16;
    innerWrapper.paddingBottom = 16;
    innerWrapper.itemSpacing = 8;
    innerWrapper.cornerRadius = 16;
    const fills = clone(innerWrapper.strokes);
    fills[0] = figma.util.solidPaint(
      DEFAULT_SETTINGS.palette.divider,
      fills[0]
    );
    innerWrapper.strokes = fills;
    innerWrapper.name = `${FIGMA_COMPONENT_PREFIX}Quote`;
    setNodeFills(innerWrapper, DEFAULT_SETTINGS.palette.surface);
    component.appendChild(innerWrapper);
    innerWrapper.layoutSizingHorizontal = 'FILL';
    //Quote
    let quoteNode = figma.createText();
    quoteNode.fontName = { family: 'Inter', style: 'Medium Italic' };
    quoteNode.fontSize = 36;
    quoteNode.characters = 'Quote';
    setNodeFills(quoteNode, DEFAULT_SETTINGS.palette.heading);
    innerWrapper.appendChild(quoteNode);
    quoteNode.layoutSizingHorizontal = 'FILL';
    contentProperty = component.addComponentProperty(
      'content',
      'TEXT',
      'Quote'
    );
    quoteNode.componentPropertyReferences = { characters: contentProperty };
    //Author
    let authorNode = figma.createText();
    authorNode.fontName = { family: 'Inter', style: 'Regular' };
    authorNode.fontSize = 16;
    authorNode.characters = '- Author';
    setNodeFills(authorNode, DEFAULT_SETTINGS.palette.paragraph);
    innerWrapper.appendChild(authorNode);
    authorNode.layoutSizingHorizontal = 'FILL';
    authorProperty = component.addComponentProperty(
      'author',
      'TEXT',
      '- Author'
    );
    authorNode.componentPropertyReferences = { characters: authorProperty };
    parent.appendChild(component);
  });
  return {
    id: component.id,
    contentProp: contentProperty,
    authorProp: authorProperty,
  };
}
