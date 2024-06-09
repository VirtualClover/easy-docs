import {
  BlockData,
  DEFAULT_HEADING_SIZES,
  DEFAULT_SETTINGS,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../general/cleanseTextData';

import { BaseFileData } from '../../constants';
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
      header.paddingBottom = 32;
      header.name = `${levelPropKey}=${i + 1}`;
      let textNode = figma.createText();
      textNode.fontName = { family: 'Inter', style: 'Bold' };
      textNode.fontSize = currentSize;
      textNode.characters = 'Heading';
      setNodeFills(
        textNode,
        DEFAULT_SETTINGS.customization.palette.onBackground.high
      );
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

export async function generateHeaderInstance(data): Promise<InstanceNode> {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let componentSet: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.header.id)
    .then((node) => {
      componentSet = node;
    })
    .catch((e) => {
      console.error(e);
    });

  if (componentSet.type == 'COMPONENT_SET') {
    let component = componentSet.children[0] as ComponentNode;
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.header.contentProp]: decodeStringForFigma(data.text),
      [componentData.header.levelProp.key]: `${data.level}`,
    });
    return instance;
    //instance.set
  }

  return null;
}

export async function generateBlockDataFromHeader(
  node: InstanceNode,
  componentData: BaseFileData,
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  let headerContent = encodeStringForHTML(
    node.componentProperties[componentData.header.contentProp].value as string
  );

  return {
    type: 'header',
    lastEdited,
    figmaNodeId,
    data: {
      text: headerContent,
      level: parseInt(
        node.componentProperties[componentData.header.levelProp.key]
          .value as string,
        10
      ),
    },
  };
}
