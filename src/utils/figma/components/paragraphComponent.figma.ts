import {
  BaseComponentData,
  BlockData,
  FIGMA_COMPONENT_DATA_KEY,
  FIGMA_COMPONENT_PREFIX,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_NAMESPACE,
  ParagraphBlockData,
} from '../../constants';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../general/cleanseTextData';
import {
  setFlavoredTextOnEncodedString,
  setFlavoredTextOnFigmaNode,
} from '../../general/flavoredText';

import { DEFAULT_FONT_FAMILIES } from '../../../styles/base';
import { getPluginSettings } from '../getPluginSettings';
import { setNodeFills } from '../setNodeFills';

export async function createParagraphComponent(parent: FrameNode) {
  let component: ComponentNode;
  let settings = getPluginSettings();
  let contentProperty: string;
  await figma.loadFontAsync({ family: DEFAULT_FONT_FAMILIES[0], style: 'Regular' }).then(() => {
    component = figma.createComponent();
    component.resizeWithoutConstraints(400, 20);
    component.layoutMode = 'HORIZONTAL';
    component.counterAxisSizingMode = 'AUTO';
    component.primaryAxisSizingMode = 'FIXED';
    component.paddingBottom = 32;
    component.name = `${FIGMA_COMPONENT_PREFIX}Paragraph`;
    let textNode = figma.createText();
    textNode.fontName = { family: DEFAULT_FONT_FAMILIES[0], style: 'Regular' };
    textNode.fontSize = 24;
    textNode.characters = 'Paragraph';
    setNodeFills(
      textNode,
      settings.customization.palette.onBackground.mid
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

export async function generateParagraphInstance(
  data: ParagraphBlockData,
  componentVersion: number
): Promise<InstanceNode> {
  let componentData: BaseComponentData = JSON.parse(
    figma.root.getSharedPluginData(FIGMA_NAMESPACE, FIGMA_COMPONENT_DATA_KEY)
  );
  let component: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.components.paragraph.id)
    .then((node) => {
      component = node;
    });
  let content = decodeStringForFigma(data.text, true);

  //console.log(content);

  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.components.paragraph.contentProp]: content,
    });

    await setFlavoredTextOnFigmaNode(content, instance);

    instance.setSharedPluginData(
      FIGMA_NAMESPACE,
      FIGMA_COMPONENT_VERSION_KEY,
      componentVersion.toString()
    );

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
  let formattedContet = encodeStringForHTML(content);
  return {
    type: 'paragraph',
    lastEdited,
    figmaNodeId,
    data: {
      text: formattedContet,
    },
  };
}
