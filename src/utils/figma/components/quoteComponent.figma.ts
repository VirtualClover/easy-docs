import { BlockData, QuoteBlockData, TextAlignment } from '../../constants';
import {
  DEFAULT_SETTINGS,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants/constants';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../general/cleanseTextData';
import {
  setFlavoredTextOnEncodedString,
  setFlavoredTextOnFigmaNode,
} from '../../general/flavoredText';

import { BaseFileData } from '../../constants/constants';
import { setNodeFills } from '../setNodeFills';
import { setNodeStrokeColor } from '../setNodeStrokeColor';

export async function createQuoteComponent(parent: FrameNode) {
  let component: ComponentNode;
  let contentProperty: string;
  let authorProperty: string;
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }).then(() => {
    component = figma.createComponent();
    component.resizeWithoutConstraints(400, 20);
    component.layoutMode = 'HORIZONTAL';
    component.counterAxisSizingMode = 'AUTO';
    component.primaryAxisSizingMode = 'FIXED';
    component.name = `${FIGMA_COMPONENT_PREFIX}Quote`;
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
    setNodeStrokeColor(
      innerWrapper,
      DEFAULT_SETTINGS.customization.palette.divider.simple
    );
    setNodeFills(innerWrapper, DEFAULT_SETTINGS.customization.palette.surface);
    component.appendChild(innerWrapper);
    innerWrapper.layoutSizingHorizontal = 'FILL';
    //Quote
    let quoteNode = figma.createText();
    quoteNode.fontName = { family: 'Inter', style: 'Regular' };
    quoteNode.fontSize = 36;
    quoteNode.characters = 'Quote';
    innerWrapper.name = 'innerWrapper';
    setNodeFills(
      quoteNode,
      DEFAULT_SETTINGS.customization.palette.onSurface.high
    );
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
    setNodeFills(
      authorNode,
      DEFAULT_SETTINGS.customization.palette.onSurface.mid
    );
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

export async function generateQuoteInstance(
  data: QuoteBlockData
): Promise<InstanceNode> {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let component: BaseNode;
  await figma.getNodeByIdAsync(componentData.quote.id).then((node) => {
    component = node;
  });

  let quoteText = decodeStringForFigma(data.text, true);

  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.quote.contentProp]: quoteText,
    });
    instance.setProperties({
      [componentData.quote.authorProp]: decodeStringForFigma(data.caption),
    });

    await setFlavoredTextOnFigmaNode(quoteText, instance, data.alignment);

    return instance;
    //instance.set
  }
  return null;
}

export async function generateBlockDataFromQuote(
  node: InstanceNode,
  componentData: BaseFileData,
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  let quoteText = setFlavoredTextOnEncodedString(node);
  let textNode = node.findOne((n) => n.type == 'TEXT') as TextNode;
  return {
    type: 'quote',
    lastEdited,
    figmaNodeId,
    data: {
      text: encodeStringForHTML(quoteText),
      caption: encodeStringForHTML(
        node.componentProperties[componentData.quote.authorProp].value as string
      ),
      alignment:
        textNode.textAlignHorizontal.toLocaleLowerCase() != 'right'
          ? (textNode.textAlignHorizontal.toLocaleLowerCase() as TextAlignment)
          : 'left',
    },
  };
}
