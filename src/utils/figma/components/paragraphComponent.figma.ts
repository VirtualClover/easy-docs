import { DEFAULT_SETTINGS, FIGMA_COMPONENT_PREFIX } from '../../constants';
import { cleanseString, decodeStringForFigma } from '../../cleanseTextData';

import { BaseFileData } from '../../constants';
import { matchFlavoredText } from '../../general/flavoredText';
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
  let flavoredMatches = matchFlavoredText(content);

  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.paragraph.contentProp]: content,
    });

    if (flavoredMatches.length) {
      await Promise.all([
        figma.loadFontAsync({ family: 'Inter', style: 'Bold' }),
        figma.loadFontAsync({ family: 'Inter', style: 'Italic' }),
        figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
      ]).then(() => {
        let textNode = instance.findOne((n) => n.type == 'TEXT') as TextNode;
        let offset = 0;
        flavoredMatches.forEach((match) => {
          console.log('match found at ' + match.index);
          let start = match.index + offset;
          let end = match[0].length + 1 + offset;
          let currentStartOffset = 7;
          let currentCloseOffset = 8;
          let currentTotalOffset = currentCloseOffset + currentStartOffset;
          console.log('match end at ' + end);
          let tag = match[1];
          switch (tag) {
            case 'b':
              textNode.setRangeFontName(start, end, {
                family: 'Inter',
                style: 'Bold',
              });

              offset += currentStartOffset;
              textNode.deleteCharacters(start, start + currentStartOffset);
              textNode.deleteCharacters(
                end - currentTotalOffset,
                end - currentStartOffset
              );
              offset += currentCloseOffset;
              break;
            case 'i':
              textNode.setRangeFontName(start, end, {
                family: 'Inter',
                style: 'Italic',
              });
              break;
          }
        });
      });
    }

    return instance;
    //instance.set
  }
  return null;
}
