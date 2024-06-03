let matchAnchorOnString = (string: string) => {
  if (string) {
    return string.match(/(<a(\shref="([^"]+)")?>(.+?)<\/a>)/gi);
  }
  return false;
};

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
