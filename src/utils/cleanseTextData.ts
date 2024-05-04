export function cleanseTextData(data) {
  if (data.text) {
    let formattedString = data.text ? (data.text as string) : ' ';
    data.text = formattedString.replace('&nbsp;', ' ');
  }
  return data;
}

export function cleanseString(string: string) {
  let formattedString = string ? (string as string) : '';
  if (formattedString) {
    formattedString = formattedString.replace('&nbsp;', ' ');
  }
  return formattedString;
}
