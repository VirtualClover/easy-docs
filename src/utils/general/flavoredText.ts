import { BASE_STYLE_TOKENS, DEFAULT_FONT_FAMILIES } from '../../styles/base';

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
  type: 'figma' | 'html' = 'figma'
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

export let getFlavoredTextTags = (matchedString: string) => {
  return matchedString.match(/\<(.*?)(\>| )/i)[1];
};

export let setFlavoredTextOnFigmaNode = async (
  string: string,
  node: TextNode | InstanceNode
) => {
  let flavoredMatches = matchFlavoredText(string);
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
              family: DEFAULT_FONT_FAMILIES[0],
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
              family: DEFAULT_FONT_FAMILIES[0],
              style: 'Italic',
            });
            globalOffset -= currentStartOffset;
            textNode.deleteCharacters(start, start + currentStartOffset);
            textNode.deleteCharacters(
              end - currentTotalOffset,
              end - currentStartOffset
            );
            globalOffset -= currentCloseOffset;
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
            globalOffset -= currentStartOffset;
            textNode.deleteCharacters(start, start + currentStartOffset);
            textNode.deleteCharacters(
              end - currentTotalOffset,
              end - currentStartOffset
            );
            globalOffset -= currentCloseOffset;
            break;
          default:
            break;
        }
      });
    });
  }
};

export let setFlavoredTextOnEncodedString = (
  node: TextNode | InstanceNode,
  customTextContent?: string
) => {
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
    if (style.fontName.style == 'Bold') {
      textContent =
        textContent.slice(0, currentStart) +
        '[[[b]]]' +
        textContent.slice(currentStart, currentEnd) +
        '[[[/b]]]' +
        textContent.slice(currentEnd);
      globalOffset += 15;
      //console.log('bold');
    }
    if (style.fontName.style == 'Italic') {
      //console.log('italic');
      textContent =
        textContent.slice(0, currentStart) +
        '[[[i]]]' +
        textContent.slice(currentStart, currentEnd) +
        '[[[/i]]]' +
        textContent.slice(currentEnd);
      globalOffset += 15;
    }
    if (style.hyperlink) {
      //console.log(textContent.slice(0, currentStart));
      textContent =
        textContent.slice(0, currentStart) +
        `[[[a href="${style.hyperlink.value}"]]]` +
        textContent.slice(currentStart, currentEnd) +
        '[[[/a]]]' +
        textContent.slice(currentEnd);
      globalOffset += 23 + style.hyperlink.value.length;
      //console.log('link');
      //console.log(encodeStringForHTML(textContent));
    }
  }

  return textContent;
};
