import { ENCODED_CHARS } from '../constants/constants';

/**
 * Cleans a text obj within a data obj for Figma
 * @param data
 * @returns
 */
export function cleanseTextData(data) {
  if (data.text) {
    data.text = decodeStringForFigma(data.text);
  }
  return data;
}

export function cleanseBlockData(data) {
  if (data.text) {
    data.text = decodeStringForFigma(data.text);
  }
  if (data.caption) {
    data.text = decodeStringForFigma(data.caption);
  }
  return data;
}

/**
 * Cleans the string for Figma
 * @param string
 * @returns
 */
export function cleanseString(string: string): string {
  //console.log(string);

  let formattedString = string ? (string as string) : '';
  if (formattedString) {
    formattedString = formattedString.replace(/&nbsp;/g, ' ');
  }
  return formattedString;
}

export function decodeStringForFigma(
  string: string,
  encodeFlavoredText = false
): string {
  if (string && typeof string === 'string') {
    let formattedString = string;
    formattedString = formattedString.replace('<br>', '\n');
    if (encodeFlavoredText) {
      formattedString = formattedString.replace(
        /</g,
        ENCODED_CHARS.brackets.open
      );
      formattedString = formattedString.replace(
        />/g,
        ENCODED_CHARS.brackets.close
      );
    }
    formattedString = formattedString.replace(/&lt;/g, '<');
    formattedString = formattedString.replace(/&gt;/g, '>');
    formattedString = formattedString.replace(/&amp;/g, '&'); //&&amp;
    formattedString = formattedString.replace(/&nbsp;/g, ' ');
    return formattedString;
  } else return '';
}

export function encodeStringForHTML(string: string): string {
  if (string && typeof string === 'string') {
    let formattedString = string;
    formattedString = formattedString.replace(/</g, '&lt;');
    formattedString = formattedString.replace(/>/g, '&gt;');
    formattedString = formattedString.replace(
      /&(?![amp|gt|lt|nbsp])/g,
      '&amp;'
    );
    formattedString = formattedString.replace(/ +$/gm, '&nbsp;');
    formattedString = formattedString.replace(/(\s)\1{1,}/g, function (x) {
      var i = 0;
      return x.replace(/\s/g, (c) => (i++ % 2 ? c : '&nbsp;'));
    });
    formattedString = formattedString.replace(/\[\[\[/g, '<');
    formattedString = formattedString.replace(/\]\]\]/g, '>');
    return formattedString;
  } else return '';
}
