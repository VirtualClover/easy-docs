import {
  FIGMA_ENCODED_CHARS,
  StringFormats,
  TextAlignment,
  UpperCaseTextAligment,
} from '../constants';

import { getPluginSettings } from '../figma/getPluginSettings';
import { setRangeNodeFills } from '../figma/setNodeFills';
import { validateFigmaNodeId } from './validateFigmaNodeId';

/**
 * Matches flavored text in a Figma encoded string
 * @param string 
 * @returns 
 */
export let matchFlavoredText = (string: string) => {
  let anchorMatches = [
    ...string.matchAll(/\[\[\[(a)\b[^\]\]\]]*\]\]\](.*?)\[\[\[\/(a)\]\]\]/gi),
  ];
  let boldMatches = [
    ...string.matchAll(/\[\[\[(b)\b[^\]\]\]]*\]\]\](.*?)\[\[\[\/(b)\]\]\]/gi),
  ];
  let italicMatches = [
    ...string.matchAll(/\[\[\[(i)\b[^\]\]\]]*\]\]\](.*?)\[\[\[\/(i)\]\]\]/gi),
  ];

  let matches = [...anchorMatches, ...boldMatches, ...italicMatches];
  matches.sort((a, b) => a.index - b.index);
  return matches;
};

/**
 * Gets the url from an HTMLanchor element
 * @param string 
 * @param type 
 * @returns 
 */
export let getURLFromAnchor = (
  string: string,
  type: StringFormats = 'figma'
) => {
  if (type == 'figma') {
    let matches = string.match(
      /\[\[\[a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1\]\]\]/
    );
    return { href: matches[2].replace(` target="_blank`, ''), tag: matches[0] };
  }
  if (type == 'html') {
    let matches = string.match(/\<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1\>/);
    return {
      href: matches[2].replace(` target="_blank"`, ''),
      tag: matches[0],
    };
  }
};


/**
 * Add flavored text to a text node in Figma
 * @param string 
 * @param node 
 * @param textAlign 
 */
export let setFlavoredTextOnFigmaNode = async (
  string: string,
  node: TextNode | InstanceNode,
  textAlign: TextAlignment | false = false
) => {
  let flavoredMatches = matchFlavoredText(string);
  let pluginSettings = getPluginSettings();
  let theme = pluginSettings.customization;

  if (flavoredMatches.length) {
    await Promise.all([
      figma.loadFontAsync({ family: theme.fontFamily, style: 'Bold' }),
      figma.loadFontAsync({
        family: theme.fontFamily,
        style: 'Italic',
      }),
      figma.loadFontAsync({
        family: theme.fontFamily,
        style: 'Regular',
      }),
    ]).then(() => {
      let textNode: TextNode;
      if (node.type === 'INSTANCE') {
        textNode = node.findOne((n) => n.type == 'TEXT') as TextNode;
      }
      if (node.type === 'TEXT') {
        textNode = node;
      }
      let globalOffset = 0;
      let charDeletions = [];
      flavoredMatches.forEach((match) => {
        let start = match.index;
        let end = match.index + match[0].length;
        let currentStartOffset = 7;
        let currentCloseOffset = 8;
        let currentTotalOffset = currentCloseOffset + currentStartOffset;
        let tag = match[1];
        switch (tag) {
          case 'b':
            textNode.setRangeFontName(start, end, {
              family: theme.fontFamily,
              style: 'Bold',
            });
            charDeletions.push({ start, end: start + currentStartOffset });
            charDeletions.push({
              start: end - currentCloseOffset,
              end: end,
            });
            break;
          case 'i':
            textNode.setRangeFontName(start, end, {
              family: theme.fontFamily,
              style: 'Italic',
            });
            charDeletions.push({ start, end: start + currentStartOffset });
            charDeletions.push({
              start: end - currentCloseOffset,
              end: end,
            });
            break;
          case 'a':
            let tagMatch = getURLFromAnchor(match[0]);
            currentStartOffset = tagMatch.tag.length;
            currentTotalOffset = currentCloseOffset + currentStartOffset;
            textNode.setRangeHyperlink(start, end, {
              type: validateFigmaNodeId(tagMatch.href) ? 'NODE' : 'URL',
              value: tagMatch.href,
            });
            textNode.setRangeTextDecoration(start, end, 'UNDERLINE');
            setRangeNodeFills(
              textNode,
              start,
              end,
              theme.palette.onBackground.link
            );
            charDeletions.push({ start, end: start + currentStartOffset });
            charDeletions.push({
              start: end - currentCloseOffset,
              end: end,
            });
            break;
          default:
            break;
        }
      });
      charDeletions.sort((a, b) => a.start - b.start);
      charDeletions.forEach((range, i) => {
        let adjustedRange = {
          start:
            range.start - globalOffset < 0 ? 0 : range.start - globalOffset,
          end:
            range.end - globalOffset > textNode.characters.length - 1
              ? textNode.characters.length
              : range.end - globalOffset,
        };
        let rangeCount = range.end - range.start;

        textNode.deleteCharacters(adjustedRange.start, adjustedRange.end);
        globalOffset += rangeCount;
      });

      if (textAlign) {
        textNode.textAlignHorizontal =
          textAlign.toLocaleUpperCase() as UpperCaseTextAligment;
      }
    });
  }
};

/**
 * Add flavored text to an encondec string gathered from the text property of a characters node
 * @param node 
 * @param customTextContent 
 * @returns 
 */
export let setFlavoredTextOnEncodedString = (
  node: TextNode | InstanceNode,
  customTextContent?: string
): string => {
  let textNode: TextNode;
  if (node.type === 'INSTANCE') {
    textNode = node.findOne((n) => n.type == 'TEXT') as TextNode;
  }
  if (node.type === 'TEXT') {
    textNode = node;
  }
  let textContent: string = customTextContent ?? textNode.characters;
  let flavoredStyles = textNode.getStyledTextSegments([
    'fontName',
    'hyperlink',
  ]);
  let globalOffset = 0;
  for (let i = 0; i < flavoredStyles.length; i++) {
    let style = flavoredStyles[i];
    let currentStart = style.start + globalOffset;
    let currentEnd = style.end + globalOffset;
    let openingTags = '';
    let closeTags = '';
    if (style.fontName.style == 'Bold') {
      openingTags =
        openingTags +
        `${FIGMA_ENCODED_CHARS.brackets.open}b${FIGMA_ENCODED_CHARS.brackets.close}`;
      closeTags =
        `${FIGMA_ENCODED_CHARS.brackets.open}/b${FIGMA_ENCODED_CHARS.brackets.close}` +
        closeTags;
      globalOffset += 15;
    }
    if (style.fontName.style == 'Italic') {
      openingTags =
        openingTags +
        `${FIGMA_ENCODED_CHARS.brackets.open}i${FIGMA_ENCODED_CHARS.brackets.close}`;
      closeTags =
        `${FIGMA_ENCODED_CHARS.brackets.open}/i${FIGMA_ENCODED_CHARS.brackets.close}` +
        closeTags;
      globalOffset += 15;
    }
    if (style.hyperlink) {
      openingTags =
        openingTags +
        `${FIGMA_ENCODED_CHARS.brackets.open}a href="${style.hyperlink.value}"${FIGMA_ENCODED_CHARS.brackets.close}`;
      closeTags =
        `${FIGMA_ENCODED_CHARS.brackets.open}/a${FIGMA_ENCODED_CHARS.brackets.close}` +
        closeTags;
      globalOffset += 23 + style.hyperlink.value.length;
    }

    textContent =
      textContent.slice(0, currentStart) +
      openingTags +
      textContent.slice(currentStart, currentEnd) +
      closeTags +
      textContent.slice(currentEnd);
  }

  return textContent;
};
