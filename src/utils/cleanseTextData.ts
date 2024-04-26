export function cleanseTextData(data) {
  let formattedString = data.text ? (data.text as string) : ' ';
  data.text = formattedString.replace('&nbsp;', ' ');
  return data;
}
