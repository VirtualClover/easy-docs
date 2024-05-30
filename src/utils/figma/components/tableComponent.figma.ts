import {
  DEFAULT_HEADING_SIZES,
  DEFAULT_SETTINGS,
  DEFAULT_TABLE_CELL_TYPES,
  FIGMA_COMPONENT_PREFIX,
  TableCellType,
} from '../../constants';

import { BaseFileData } from '../../constants';
import { clone } from '../../clone';
import { decodeStringForFigma } from '../../cleanseTextData';
import { setNodeFills } from '../setNodeFills';

export async function createTableCellComponent(
  parent: FrameNode,
  cellTypes = DEFAULT_TABLE_CELL_TYPES
) {
  let set: ComponentNode[] = [];
  let componentSet: ComponentSetNode;
  let contentProperty: string;
  let cellTypePropKey: string = 'type';
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' }).then(() => {
    for (let i = 0; i < cellTypes.length; i++) {
      const currentType = cellTypes[i];
      let isHeader = currentType == 'header';
      let cell = figma.createComponent();
      cell.resizeWithoutConstraints(220, 70);
      cell.layoutMode = 'HORIZONTAL';
      cell.counterAxisSizingMode = 'AUTO';
      cell.primaryAxisSizingMode = 'FIXED';
      cell.verticalPadding = 16;
      cell.horizontalPadding = 16;
      cell.name = `${cellTypePropKey}=${currentType}`;
      let bgColor = DEFAULT_SETTINGS.customization.palette.background.default;
      switch (currentType) {
        case 'bodyAlt':
          bgColor = DEFAULT_SETTINGS.customization.palette.background.tonal_low;
          break;
        case 'header':
          bgColor =
            DEFAULT_SETTINGS.customization.palette.background.tonal_high;
          break;
        default:
          break;
      }
      setNodeFills(cell, bgColor);
      cell.strokeRightWeight = 1;
      const fills = clone(cell.strokes);
      fills[0] = figma.util.solidPaint(
        DEFAULT_SETTINGS.customization.palette.divider.simple,
        fills[0]
      );
      cell.strokes = fills;
      let textNode = figma.createText();
      textNode.fontName = {
        family: 'Inter',
        style: isHeader ? 'Bold' : 'Regular',
      };
      textNode.fontSize = isHeader ? 18 : 16;
      textNode.characters = 'Cell content';
      setNodeFills(
        textNode,
        DEFAULT_SETTINGS.customization.palette.onBackground[
          isHeader ? 'high' : 'mid'
        ]
      );
      cell.appendChild(textNode);
      textNode.layoutSizingHorizontal = 'FILL';
      contentProperty = cell.addComponentProperty(
        'content',
        'TEXT',
        'Cell content'
      );
      textNode.componentPropertyReferences = { characters: contentProperty };
      set.push(cell);
    }

    componentSet = figma.combineAsVariants(set, parent);
    componentSet.layoutMode = 'VERTICAL';
    componentSet.itemSpacing = 90;
    componentSet.name = `${FIGMA_COMPONENT_PREFIX}TableCell`;
  });
  //console.log(componentSet.componentPropertyDefinitions);
  return {
    id: componentSet.id,
    contentProp: Object.keys(componentSet.componentPropertyDefinitions)[0],
    typeProp: {
      key: cellTypePropKey,
      variables:
        componentSet.componentPropertyDefinitions[cellTypePropKey]
          .variantOptions,
    },
  };
}
