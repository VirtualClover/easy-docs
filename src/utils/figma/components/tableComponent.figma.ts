import {
  BaseFileData,
  DEFAULT_SETTINGS,
  DEFAULT_TABLE_CELL_TYPES,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants';

import { clone } from '../../clone';
import { isOdd } from '../../general/isOdd';
import { setNodeFills } from '../setNodeFills';
import { setNodeStrokeColor } from '../setNodeStrokeColor';

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

async function generateTableWrapper() {
  //Outer wrapper
  let outerWrapper = figma.createFrame();
  outerWrapper.layoutMode = 'VERTICAL';
  outerWrapper.counterAxisSizingMode = 'FIXED';
  outerWrapper.primaryAxisSizingMode = 'AUTO';
  outerWrapper.itemSpacing = 0;
  outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}Table`;
  outerWrapper.strokeWeight = 1;
  outerWrapper.clipsContent = true;
  setNodeStrokeColor(
    outerWrapper,
    DEFAULT_SETTINGS.customization.palette.divider.simple
  );
  return outerWrapper;
}

async function generateTableRow(index: number, hasHeader: boolean = false) {
  //Outer wrapper
  let outerWrapper = figma.createFrame();
  outerWrapper.layoutMode = 'HORIZONTAL';
  outerWrapper.counterAxisSizingMode = 'AUTO';
  outerWrapper.primaryAxisSizingMode = 'FIXED';
  outerWrapper.itemSpacing = 0;
  outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}TableRow`;
  outerWrapper.strokeWeight = 1;
  if ((isOdd(index) && !hasHeader) || (!isOdd(index) && hasHeader)) {
    setNodeFills(
      outerWrapper,
      DEFAULT_SETTINGS.customization.palette.background.default
    );
  } else {
    setNodeFills(
      outerWrapper,
      DEFAULT_SETTINGS.customization.palette.background.tonal_low
    );
  }

  return outerWrapper;
}

export async function generateTableInstance(data): Promise<FrameNode | null> {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let componentSet: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.tableCell.id)
    .then((node) => {
      componentSet = node;
    })
    .catch((e) => {
      console.error(e);
    });

  if (componentSet.type == 'COMPONENT_SET') {
    let component = componentSet.children[0] as ComponentNode;
    let tableWrapper = await generateTableWrapper();

    for (let i = 0; i < data.content.length; i++) {
      const row = data.content[i];
      let rowWrapper = await generateTableRow(i);
      for (let ci = 0; ci < row.length; ci++) {
        const cellContent = row[ci];
        let cellInstance = component.createInstance();

        cellInstance.setProperties({
          [componentData.tableCell.contentProp]: cellContent,
          [componentData.tableCell.typeProp.key]:
            data.withHeadings && i == 0 ? 'header' : 'body',
        });
        rowWrapper.appendChild(cellInstance);
      }
      tableWrapper.appendChild(row);
    }

    return tableWrapper;
  }

  return null;
}
