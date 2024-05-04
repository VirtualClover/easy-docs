export function formatFrameIdForURLs(
  id: string,
  treatment: 'encode' | 'decode' = 'encode'
) {
  if (treatment == 'decode') {
    return id.replace('%3A', ':');
  } else {
    return id.replace(':', '%3A');
  }
}

export function getDetailsFromFigmaURL(
  url: string,
  frameIdTreatment: 'encode' | 'decode' = 'encode'
) {
  let fileId = url.match('(?<=file/)(.*?)(?=/)')[0];
  let frameId = url.match('(?<=node-id=)(.*?)(?=&mode)')[0];

  return {
    fileId: fileId,
    frameId: formatFrameIdForURLs(frameId, frameIdTreatment),
  };
}

export function generateFigmaURL(
  fileId: string,
  frameId: string,
  type: 'embed' | 'share'
) {
  let formatedFrameID = formatFrameIdForURLs(frameId, 'encode');
  if (type == 'embed') {
    return `https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${formatedFrameID}`;
  } else {
    return `https://www.figma.com/file/${fileId}/Untitled?type=design&node-id=${formatedFrameID}&mode=design`;
  }
}
