import { FrameDetailsFromURL } from '../constants';

type FrameIdTreatment = 'encode' | 'decode';
type FigmaURLType = 'embed' | 'share';

export function formatFrameIdForURLs(
  id: string,
  treatment: FrameIdTreatment = 'encode'
) {
  if (treatment == 'decode') {
    return id.replace('%3A', ':');
  } else {
    return id.replace(':', '%3A');
  }
}

export function getDetailsFromFigmaURL(
  url: string,
  frameIdTreatment: FrameIdTreatment = 'encode'
): FrameDetailsFromURL {
  if (url) {
    let fileId = url.match('(?<=file/)(.*?)(?=/)')[0];
    let frameId = url.match('(?<=node-id=)(.*?)(?=&mode)')[0];

    return {
      fileId: fileId,
      frameId: formatFrameIdForURLs(frameId, frameIdTreatment),
    };
  }

  return {
    fileId: '',
    frameId: '',
  };
}

export function generateFigmaURL(
  fileId: string,
  frameId: string,
  type: FigmaURLType
) {
  if (!fileId || !frameId) {
    return '';
  } else {
    let formatedFrameID = formatFrameIdForURLs(frameId, 'encode');
    if (type == 'embed') {
      return `https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${formatedFrameID}`;
    } else {
      return `https://www.figma.com/file/${fileId}/Untitled?type=design&node-id=${formatedFrameID}&mode=design`;
    }
  }
}
