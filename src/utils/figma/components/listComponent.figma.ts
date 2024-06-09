import {
  BlockData,
  DEFAULT_SETTINGS,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../general/cleanseTextData';
import {
  setFlavoredTextOnEncodedString,
  setFlavoredTextOnFigmaNode,
} from '../../general/flavoredText';

import { BaseFileData } from '../../constants';
import { clone } from '../../clone';
import { setNodeFills } from '../setNodeFills';

export async function createListComponent(parent: FrameNode) {
  let component: ComponentNode;
  let contentProperty: string;
  let defaultStyle: TextListOptions = { type: 'UNORDERED' };
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }).then(() => {
    component = figma.createComponent();
    component.resizeWithoutConstraints(400, 20);
    component.layoutMode = 'HORIZONTAL';
    component.counterAxisSizingMode = 'AUTO';
    component.primaryAxisSizingMode = 'FIXED';
    component.paddingBottom = 32;
    component.name = `${FIGMA_COMPONENT_PREFIX}List`;
    let textNode = figma.createText();
    textNode.fontName = { family: 'Inter', style: 'Regular' };
    textNode.fontSize = 24;
    textNode.characters = 'List';
    textNode.setRangeListOptions(0, textNode.characters.length, defaultStyle);
    setNodeFills(
      textNode,
      DEFAULT_SETTINGS.customization.palette.onBackground.mid
    );
    component.appendChild(textNode);
    textNode.layoutSizingHorizontal = 'FILL';
    contentProperty = component.addComponentProperty('content', 'TEXT', 'List');
    textNode.componentPropertyReferences = { characters: contentProperty };
    parent.appendChild(component);
  });
  return {
    id: component.id,
    contentProp: contentProperty,
  };
}

export async function generateListInstance(data): Promise<InstanceNode> {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let component: BaseNode;
  await figma.getNodeByIdAsync(componentData.list.id).then((node) => {
    component = node;
  });
  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    let jointData = '';
    let jointDataDecoded = '';
    //console.log('data items');

    //console.log(data.items);

    //Get text node
    let textNode = instance.findOne((n) => n.type === 'TEXT');
    if (data.items.length) {
      jointData = data.items.join('\n');
      jointDataDecoded = decodeStringForFigma(jointData, true);
      //console.log(data.items);
      //console.log('joint data');
      //console.log(jointData);
    }
    instance.setProperties({
      [componentData.list.contentProp]: jointDataDecoded,
    });
    //console.log('here');
    await figma
      .loadFontAsync({ family: 'Inter', style: 'Regular' })
      .then(() => {
        if (textNode.type == 'TEXT' && jointDataDecoded.length) {
          textNode.setRangeListOptions(0, jointDataDecoded.length, {
            type: data.style.toUpperCase(),
          });
        }
      });
    await setFlavoredTextOnFigmaNode(jointDataDecoded, instance);
    return instance;
    //instance.set
  }
  return null;
}

export async function generateBlockDataFromList(
  node: InstanceNode,
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  let listTextContent = setFlavoredTextOnEncodedString(node);
  let content = clone(encodeStringForHTML(listTextContent));
  //console.log('unformattedcontent');
  //console.log(unformattedContent);
  let emptyLastItem: boolean = false;
  if (content.match(/\n+$/gm)) {
    emptyLastItem = true;
    //console.log('empty line true!');
  }
  let arr = [];
  if (content) {
    content = content.replace(/\n\<\/b\>/g, '</b>\n');
    content = content.replace(/\n\<\/i\>/g, '</i>\n');
    content = content.replace(/\n\<\/a\>/g, '</a>\n');
    arr = content.split('\n');
  }
  let listStyle: string = 'unordered';
  let textNode = node.findOne((n) => n.type === 'TEXT') as TextNode;
  if (textNode.characters.length) {
    let unformattedStyle = textNode.getRangeListOptions(
      0,
      textNode.characters.length
    );
    if (unformattedStyle != figma.mixed && unformattedStyle.type != 'NONE') {
      listStyle = unformattedStyle.type.toLowerCase();
    } else {
      await figma
        .loadFontAsync({ family: 'Inter', style: 'Regular' })
        .then(() => {
          textNode.setRangeListOptions(0, textNode.characters.length, {
            type: 'UNORDERED',
          });
        });
    }
  }

  return {
    type: 'list',
    lastEdited,
    figmaNodeId,
    data: {
      items: arr,
      style: listStyle,
    },
  };
  //console.log(arr);
}
