import { BASE_STYLE_TOKENS, DEFAULT_FONT_FAMILIES } from '../../styles/base';
import { TextAlignment, UpperCaseTextAligment } from '../constants';

import { StringFormats } from '../constants/constants';
import { setRangeNodeFills } from '../figma/setNodeFills';

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
  //console.log(matches);

  let matches = [...anchorMatches, ...boldMatches, ...italicMatches];
  matches.sort((a, b) => a.index - b.index);
  return matches;
};

export let getURLFromAnchor = (
  string: string,
  type: StringFormats = 'figma'
) => {
  if (type == 'figma') {
    let matches = string.match(
      /\[\[\[a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1\]\]\]/
    );
    return { href: matches[2], tag: matches[0] };
  }
  if (type == 'html') {
    let matches = string.match(/\<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1\>/);
    return { href: matches[2], tag: matches[0] };
  }
};

export let getFlavoredTextTags = (matchedString: string): string => {
  return matchedString.match(/\<(.*?)(\>| )/i)[1];
};

export let setFlavoredTextOnFigmaNode = async (
  string: string,
  node: TextNode | InstanceNode,
  textAlign: TextAlignment | false = false
) => {
  let flavoredMatches = matchFlavoredText(string);
  console.log(flavoredMatches);

  if (flavoredMatches.length) {
    await Promise.all([
      figma.loadFontAsync({ family: DEFAULT_FONT_FAMILIES[0], style: 'Bold' }),
      figma.loadFontAsync({
        family: DEFAULT_FONT_FAMILIES[0],
        style: 'Italic',
      }),
      figma.loadFontAsync({
        family: DEFAULT_FONT_FAMILIES[0],
        style: 'Regular',
      }),
    ]).then(() => {
      //console.log('gets here');
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
        //console.log('start wo offset ' + match.index);
        //console.log('start w offset ' + match.index);
        let start = match.index;
        //console.log(string);
        //console.log(match);
        //console.log(match.index);
        //console.log(start);
        let end = match.index + match[0].length;
        let currentStartOffset = 7;
        let currentCloseOffset = 8;
        let currentTotalOffset = currentCloseOffset + currentStartOffset;
        //console.log('end wo offset ' + match.index + match[0].length);
        //console.log('end w offset ' + end);
        let tag = match[1];
        switch (tag) {
          case 'b':
            textNode.setRangeFontName(start, end, {
              family: DEFAULT_FONT_FAMILIES[0],
              style: 'Bold',
            });
            charDeletions.push({ start, end: start + currentStartOffset });
            //textNode.deleteCharacters(start, start + currentStartOffset);
            charDeletions.push({
              start: end - currentCloseOffset,
              end: end,
            });
            /*textNode.deleteCharacters(
              end - currentTotalOffset,
              end - currentStartOffset
            );*/
            break;
          case 'i':
            textNode.setRangeFontName(start, end, {
              family: DEFAULT_FONT_FAMILIES[0],
              style: 'Italic',
            });
            charDeletions.push({ start, end: start + currentStartOffset });
            //textNode.deleteCharacters(start, start + currentStartOffset);
            charDeletions.push({
              start: end - currentCloseOffset,
              end: end,
            });
            /*textNode.deleteCharacters(
              end - currentTotalOffset,
              end - currentStartOffset
            );*/
            break;
          case 'a':
            let tagMatch = getURLFromAnchor(match[0]);
            currentStartOffset = tagMatch.tag.length;
            currentTotalOffset = currentCloseOffset + currentStartOffset;
            textNode.setRangeHyperlink(start, end, {
              type: 'URL',
              value: tagMatch.href,
            });
            textNode.setRangeTextDecoration(start, end, 'UNDERLINE');
            setRangeNodeFills(
              textNode,
              start,
              end,
              BASE_STYLE_TOKENS.palette.onBackground.link
            );
            charDeletions.push({ start, end: start + currentStartOffset });
            //textNode.deleteCharacters(start, start + currentStartOffset);
            charDeletions.push({
              start: end - currentCloseOffset,
              end: end,
            });
            /*textNode.deleteCharacters(
              end - currentTotalOffset,
              end - currentStartOffset
            );*/
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
    //console.log(style);
    let currentStart = style.start + globalOffset;
    let currentEnd = style.end + globalOffset;
    let openingTags = '';
    let closeTags = '';
    if (style.fontName.style == 'Bold') {
      openingTags = openingTags + '[[[b]]]';
      closeTags = '[[[/b]]]' + closeTags;
      globalOffset += 15;
      //console.log('bold');
    }
    if (style.fontName.style == 'Italic') {
      //console.log('italic');
      openingTags = openingTags + '[[[i]]]';
      closeTags = '[[[/i]]]' + closeTags;
      globalOffset += 15;
    }
    if (style.hyperlink) {
      //console.log(textContent.slice(0, currentStart));
      openingTags = openingTags + `[[[a href="${style.hyperlink.value}"]]]`;
      closeTags = '[[[/a]]]' + closeTags;
      globalOffset += 23 + style.hyperlink.value.length;
      //console.log('link');
      //console.log(encodeStringForHTML(textContent));
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
