import { setRangeNodeFills } from '../figma/setNodeFills';

export let matchFlavoredText = (string: string) => {
  let matches = [
    ...string.matchAll(
      /\[\[\[(a|b|i)\b[^\]\]\]]*\]\]\](.*?)\[\[\[\/(a|b|i)\]\]\]/gi
    ),
  ];
  //console.log(matches);
  return matches;
};

export let getURLFromAnchor = (string: string, type = 'figma') => {
  if (type == 'figma') {
    let matches = string.match(
      /\[\[\[a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1\]\]\]/
    );
    return { href: matches[2], tag: matches[0] };
  }
};

export let getFlavoredTextTags = (matchedString: string) => {
  return matchedString.match(/\<(.*?)(\>| )/i)[1];
};

let matchAnchorOnFigmaNode = (textNode: TextNode) => {
  return textNode.getStyledTextSegments(['hyperlink']);
};

export let setFlavoredTextOnFigmaNode = async (
  string: string,
  node: TextNode | InstanceNode
) => {
  let flavoredMatches = matchFlavoredText(string);
  if (flavoredMatches.length) {
    await Promise.all([
      figma.loadFontAsync({ family: 'Inter', style: 'Bold' }),
      figma.loadFontAsync({ family: 'Inter', style: 'Italic' }),
      figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
    ]).then(() => {
      console.log('gets here');
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
            let tagMatch = getURLFromAnchor(match[0]);
            currentStartOffset = tagMatch.tag.length;
            currentTotalOffset = currentCloseOffset + currentStartOffset;
            textNode.setRangeHyperlink(start, end, {
              type: 'URL',
              value: tagMatch.href,
            });
            textNode.setRangeTextDecoration(start, end, 'UNDERLINE');
            setRangeNodeFills(textNode, start, end, '#5551ff');
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
