import { DEFAULT_SETTINGS, FIGMA_COMPONENT_PREFIX } from '../../constants';
import { cleanseString, decodeStringForFigma } from '../../cleanseTextData';
import {
  getURLFromAnchor,
  matchFlavoredText,
} from '../../general/flavoredText';
import { setNodeFills, setRangeNodeFills } from '../setNodeFills';

import { BaseFileData } from '../../constants';

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

  console.log(content);

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
        console.log('gets here');

        let textNode = instance.findOne((n) => n.type == 'TEXT') as TextNode;
        let globalOffset = 0;
        flavoredMatches.forEach((match) => {
          //console.log('start wo offset ' + match.index);
          //console.log('start w offset ' + match.index);
          let start = match.index + globalOffset;
          let end = match.index + match[0].length + globalOffset;
          let currentStartOffset = 7;
          let currentCloseOffset = 8;
          let currentTotalOffset = currentCloseOffset + currentStartOffset;
          //console.log('end wo offset ' + match.index + match[0].length);
          //console.log('end w offset ' + end);
          let tag = match[1];
          switch (tag) {
            case 'b':
              textNode.setRangeFontName(start, end, {
                family: 'Inter',
                style: 'Bold',
              });

              globalOffset -= currentStartOffset;
              textNode.deleteCharacters(start, start + currentStartOffset);
              textNode.deleteCharacters(
                end - currentTotalOffset,
                end - currentStartOffset
              );
              globalOffset -= currentCloseOffset;
              break;
            case 'i':
              textNode.setRangeFontName(start, end, {
                family: 'Inter',
                style: 'Italic',
              });
              globalOffset += currentStartOffset;
              textNode.deleteCharacters(start, start + currentStartOffset);
              textNode.deleteCharacters(
                end - currentTotalOffset,
                end - currentStartOffset
              );
              globalOffset -= currentCloseOffset;
              break;
            case 'a':
              console.log('Gets to a');

              let tagMatch = getURLFromAnchor(match[0]);
              console.log('Gets to 2');
              currentStartOffset = tagMatch.tag.length;
              currentTotalOffset = currentCloseOffset + currentStartOffset;
              textNode.setRangeHyperlink(start, end, {
                type: 'URL',
                value: tagMatch.href,
              });
              textNode.setRangeTextDecoration(start, end, 'UNDERLINE');
              console.log('Gets to a 3');
              setRangeNodeFills(textNode, start, end, '#5551ff');
              globalOffset -= currentStartOffset;
              textNode.deleteCharacters(start, start + currentStartOffset);
              textNode.deleteCharacters(
                end - currentTotalOffset,
                end - currentStartOffset
              );
              console.log('Gets to 4');
              globalOffset -= currentCloseOffset;
              break;
            default:
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
