import {
  DEFAULT_HEADING_SIZES,
  DEFAULT_SETTINGS,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants';

import { setNodeFills } from '../setNodeFills';

export async function createHeaderComponent(
  parent: FrameNode,
  headingSizes: number[] = DEFAULT_HEADING_SIZES
) {
  let set: ComponentNode[] = [];
  let componentSet: ComponentSetNode;
  let contentProperty: string;
  let levelPropKey: string = 'level';
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' }).then(() => {
    for (let i = 0; i < headingSizes.length; i++) {
      const currentSize = headingSizes[i];
      let header = figma.createComponent();
      header.resizeWithoutConstraints(400, 20);
      header.layoutMode = 'HORIZONTAL';
      header.counterAxisSizingMode = 'AUTO';
      header.primaryAxisSizingMode = 'FIXED';
      header.name = `${levelPropKey}=${i + 1}`;
      let textNode = figma.createText();
      textNode.fontName = { family: 'Inter', style: 'Bold' };
      textNode.fontSize = currentSize;
      textNode.characters = 'Heading';
      setNodeFills(textNode, DEFAULT_SETTINGS.palette.heading);
      header.appendChild(textNode);
      textNode.layoutSizingHorizontal = 'FILL';
      contentProperty = header.addComponentProperty(
        'content',
        'TEXT',
        'Heading'
      );
      textNode.componentPropertyReferences = { characters: contentProperty };
      set.push(header);
    }

    componentSet = figma.combineAsVariants(set, parent);
    componentSet.layoutMode = 'VERTICAL';
    componentSet.itemSpacing = 90;
    componentSet.name = `${FIGMA_COMPONENT_PREFIX}Heading`;
  });
  //console.log(componentSet.componentPropertyDefinitions);
  return {
    id: componentSet.id,
    contentProp: Object.keys(componentSet.componentPropertyDefinitions)[0],
    levelProp: {
      key: levelPropKey,
      variables:
        componentSet.componentPropertyDefinitions[levelPropKey].variantOptions,
    },
  };
}
