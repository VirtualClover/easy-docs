import {
  BaseComponentData,
  BlockData,
  DEFAULT_TABLE_CELL_TYPES,
  FIGMA_COMPONENT_PREFIX,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_NAMESPACE,
  TableBlockData,
} from '../../constants';
import { ColorPalette, DEFAULT_FONT_FAMILIES } from '../../../styles/base';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../general/cleanseTextData';
import {
  setFlavoredTextOnEncodedString,
  setFlavoredTextOnFigmaNode,
} from '../../general/flavoredText';

import { clone } from '../../general/clone';
import { getComponentData } from '../getComponentData';
import { getMainCompIdFromInstance } from '../getMainCompIdFromInstance';
import { getPluginSettings } from '../getPluginSettings';
import { isOdd } from '../../general/isOdd';
import { setNodeFills } from '../setNodeFills';
import { setNodeStrokeColor } from '../setNodeStrokeColor';

export async function createTableCellComponent(
  parent: FrameNode,
  cellTypes = DEFAULT_TABLE_CELL_TYPES
) {
  let settings = getPluginSettings();
  let set: ComponentNode[] = [];
  let componentSet: ComponentSetNode;
  let contentProperty: string;
  let cellTypePropKey: string = 'type';
  await figma
    .loadFontAsync({ family: DEFAULT_FONT_FAMILIES[0], style: 'Bold' })
    .then(() => {
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
        if (currentType === 'header') {
          let bgColor = settings.customization.palette.background.tonal_high;
          setNodeFills(cell, bgColor);
        }
        cell.strokeRightWeight = 1;
        const fills = clone(cell.strokes);
        fills[0] = figma.util.solidPaint(
          settings.customization.palette.divider.simple,
          fills[0]
        );
        cell.strokes = fills;
        let textNode = figma.createText();
        textNode.fontName = {
          family: DEFAULT_FONT_FAMILIES[0],
          style: isHeader ? 'Bold' : 'Regular',
        };
        textNode.fontSize = isHeader ? 18 : 16;
        textNode.characters = 'Cell content';
        setNodeFills(
          textNode,
          settings.customization.palette.onBackground[isHeader ? 'high' : 'mid']
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

async function generateTableWrapper(palette: ColorPalette) {
  //Outer wrapper
  let outerWrapper = figma.createFrame();
  outerWrapper.layoutMode = 'VERTICAL';
  outerWrapper.counterAxisSizingMode = 'FIXED';
  outerWrapper.primaryAxisSizingMode = 'AUTO';
  outerWrapper.itemSpacing = 0;
  outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}TableWrapper`;
  outerWrapper.strokeWeight = 1;
  outerWrapper.cornerRadius = 16;
  outerWrapper.clipsContent = true;
  setNodeStrokeColor(outerWrapper, palette.divider.simple);
  return outerWrapper;
}

async function generateTableRow(
  index: number,
  palette: ColorPalette,
  hasHeader: boolean = false
) {
  //Outer wrapper
  let outerWrapper = figma.createFrame();
  outerWrapper.layoutMode = 'HORIZONTAL';
  outerWrapper.counterAxisSizingMode = 'AUTO';
  outerWrapper.primaryAxisSizingMode = 'FIXED';
  outerWrapper.itemSpacing = 0;
  outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}TableRow`;
  outerWrapper.strokeWeight = 1;
  if ((isOdd(index) && !hasHeader) || (!isOdd(index) && hasHeader)) {
    setNodeFills(outerWrapper, palette.background.default);
  } else {
    setNodeFills(outerWrapper, palette.background.tonal_low);
  }

  return outerWrapper;
}

export async function generateTableInstance(
  data: TableBlockData,
  componentVersion: number
): Promise<FrameNode | null> {
  let settings = getPluginSettings();
  let componentData = getComponentData();
  let componentSet: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.components.tableCell.id)
    .then((node) => {
      componentSet = node;
    })
    .catch((e) => {
      console.error(e);
    });

  if (componentSet.type == 'COMPONENT_SET') {
    let component = componentSet.children[0] as ComponentNode;
    let tableInnerWrapper = await generateTableWrapper(
      settings.customization.palette
    );

    //Outside table wrapper
    let tableWrapper = figma.createFrame();
    tableWrapper.layoutMode = 'VERTICAL';
    tableWrapper.counterAxisSizingMode = 'FIXED';
    tableWrapper.primaryAxisSizingMode = 'AUTO';
    tableWrapper.itemSpacing = 0;
    tableWrapper.name = `${FIGMA_COMPONENT_PREFIX}Table`;
    tableWrapper.paddingBottom = 32;

    if (data.content.length) {
      for (let i = 0; i < data.content.length; i++) {
        const row = data.content[i];
        let rowWrapper = await generateTableRow(
          i,
          settings.customization.palette
        );
        for (let ci = 0; ci < row.length; ci++) {
          const cellContent = decodeStringForFigma(row[ci], true);
          let cellInstance = component.createInstance();

          cellInstance.setProperties({
            [componentData.components.tableCell.contentProp]: cellContent,
            [componentData.components.tableCell.typeProp.key]:
              data.withHeadings && i == 0 ? 'header' : 'body',
          });
          cellInstance.setSharedPluginData(
            FIGMA_NAMESPACE,
            FIGMA_COMPONENT_VERSION_KEY,
            componentVersion.toString()
          );

          await setFlavoredTextOnFigmaNode(cellContent, cellInstance);

          rowWrapper.appendChild(cellInstance);
          cellInstance.layoutSizingHorizontal = 'FILL';
        }
        tableInnerWrapper.appendChild(rowWrapper);
        rowWrapper.layoutSizingHorizontal = 'FILL';
      }
    } else {
      let rowWrapper = await generateTableRow(
        0,
        settings.customization.palette
      );
      let cellContent = 'Item 1';
      let cellInstance = component.createInstance();
      cellInstance.setSharedPluginData(
        FIGMA_NAMESPACE,
        FIGMA_COMPONENT_VERSION_KEY,
        componentVersion.toString()
      );

      cellInstance.setProperties({
        [componentData.components.tableCell.contentProp]: cellContent,
        [componentData.components.tableCell.typeProp.key]: data.withHeadings
          ? 'header'
          : 'body',
      });

      rowWrapper.appendChild(cellInstance);
      tableInnerWrapper.appendChild(rowWrapper);
    }

    tableWrapper.appendChild(tableInnerWrapper);
    tableInnerWrapper.layoutSizingHorizontal = 'FILL';

    return tableWrapper;
  }

  return null;
}

export async function generateBlockDataFromTable(
  instNode: InstanceNode,
  mainCompId: string,
  componentData: BaseComponentData,
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  let content: string[][] = [];
  let row = instNode.parent;
  let tableWrapper = row.parent;
  let withHeadings = false;
  for (let i = 0; i < tableWrapper.children.length; i++) {
    let currentRow = tableWrapper.children[i];
    if (currentRow.type === 'FRAME') {
      let tempRowContent: string[] = [];
      for (let ci = 0; ci < currentRow.children.length; ci++) {
        const cell = currentRow.children[ci];
        if (cell.type === 'INSTANCE') {
          await getMainCompIdFromInstance(instNode).then((id) => {
            mainCompId == id;
            if (mainCompId === componentData.components.tableCell.id) {
              // Check if header
              if (i == 0 && ci == 0) {
                withHeadings =
                  cell.componentProperties[
                    componentData.components.tableCell.typeProp.key
                  ].value == 'header';
              }
              let cellContent = setFlavoredTextOnEncodedString(cell);
              tempRowContent.push(encodeStringForHTML(cellContent));
            }
          });
        }
      }
      content.push(tempRowContent);
    }
  }
  return {
    type: 'table',
    lastEdited,
    figmaNodeId,
    data: {
      content: content,
      withHeadings,
    },
  };
}
