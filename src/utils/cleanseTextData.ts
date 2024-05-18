/**
 * Cleans a text obj within a data obj for Figma
 * @param data
 * @returns
 */
export function cleanseTextData(data) {
  if (data.text) {
    data.text = cleanseString(data.text);
  }
  return data;
}

/**
 * Cleans the string for Figma
 * @param string
 * @returns
 */
export function cleanseString(string: string): string {
  console.log(string);

  let formattedString = string ? (string as string) : '';
  if (formattedString) {
    formattedString = formattedString.replace('&nbsp;', ' ');
  }
  return formattedString;
}
