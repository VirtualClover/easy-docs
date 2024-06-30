import {
  BaseComponentData,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants/constants';
import {
  BlockData,
  FIGMA_COMPONENT_DATA_KEY,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_NAMESPACE,
  QuoteBlockData,
  TextAlignment,
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
import { setNodeStrokeColor } from '../setNodeStrokeColor';

export async function createQuoteComponent(parent: FrameNode) {
  let settings = getPluginSettings();
  let component: ComponentNode;
  let contentProperty: string;
  let authorProperty: string;
  await figma
    .loadFontAsync({ family: DEFAULT_FONT_FAMILIES[0], style: 'Regular' })
    .then(() => {
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
        settings.customization.palette.divider.simple
      );
      setNodeFills(innerWrapper, settings.customization.palette.surface);
      component.appendChild(innerWrapper);
      innerWrapper.layoutSizingHorizontal = 'FILL';
      //Quote
      let quoteNode = figma.createText();
      quoteNode.fontName = {
        family: DEFAULT_FONT_FAMILIES[0],
        style: 'Regular',
      };
      quoteNode.fontSize = 36;
      quoteNode.characters = 'Quote';
      innerWrapper.name = 'innerWrapper';
      setNodeFills(quoteNode, settings.customization.palette.onSurface.high);
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
      authorNode.fontName = {
        family: DEFAULT_FONT_FAMILIES[0],
        style: 'Regular',
      };
      authorNode.fontSize = 16;
      authorNode.characters = '- Author';
      setNodeFills(authorNode, settings.customization.palette.onSurface.mid);
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
  data: QuoteBlockData,
  componentVersion: number
): Promise<InstanceNode> {
  let componentData: BaseComponentData = JSON.parse(
    figma.root.getSharedPluginData(FIGMA_NAMESPACE, FIGMA_COMPONENT_DATA_KEY)
  );
  let component: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.components.quote.id)
    .then((node) => {
      component = node;
    });

  let quoteText = decodeStringForFigma(data.text, true);

  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.components.quote.contentProp]: quoteText,
    });
    instance.setProperties({
      [componentData.components.quote.authorProp]: decodeStringForFigma(
        data.caption
      ),
    });

    await setFlavoredTextOnFigmaNode(quoteText, instance, data.alignment);

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

export async function generateBlockDataFromQuote(
  node: InstanceNode,
  componentData: BaseComponentData,
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
        node.componentProperties[componentData.components.quote.authorProp]
          .value as string
      ),
      alignment:
        textNode.textAlignHorizontal.toLocaleLowerCase() != 'right'
          ? (textNode.textAlignHorizontal.toLocaleLowerCase() as TextAlignment)
          : 'left',
    },
  };
}
