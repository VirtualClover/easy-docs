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
    component.paddingBottom = 32;
    component.name = `${FIGMA_COMPONENT_PREFIX}Paragraph`;
    let textNode = figma.createText();
    textNode.fontName = { family: 'Inter', style: 'Regular' };
    textNode.fontSize = 24;
    textNode.characters = 'Paragraph';
    setNodeFills(
      textNode,
      DEFAULT_SETTINGS.customization.palette.onBackground.mid
    );
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

export async function generateParagraphInstance(data): Promise<InstanceNode> {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let component: BaseNode;
  await figma.getNodeByIdAsync(componentData.paragraph.id).then((node) => {
    component = node;
  });
  let content = decodeStringForFigma(data.text, true);

  //console.log(content);

  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.paragraph.contentProp]: content,
    });

    await setFlavoredTextOnFigmaNode(content, instance);

    return instance;
    //instance.set
  }
  return null;
}

export async function generateBlockDataFromParagraph(
  node: InstanceNode,
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  let content = setFlavoredTextOnEncodedString(node);
  return {
    type: 'paragraph',
    lastEdited,
    figmaNodeId,
    data: {
      text: encodeStringForHTML(content),
    },
  };
}
