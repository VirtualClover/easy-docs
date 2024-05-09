import { FrameDetailsFromURL } from '../constants';

type FrameIdTreatment = 'encode' | 'decode';
type FigmaURLType = 'embed' | 'share';

/**
 * Formats the frame ID for a specific URL
 * @param id
 * @param treatment
 * @returns
 */
export function formatFrameIdForURLs(
  id: string,
  treatment: FrameIdTreatment = 'encode'
): string {
  if (treatment == 'decode') {
    return id.replace('%3A', ':');
  } else {
    return id.replace(':', '%3A');
  }
}

/**
 * Extracts the frame and file ID from the figma URL
 * @param url
 * @param frameIdTreatment
 * @returns
 */
export function getDetailsFromFigmaURL(
  url: string,
  frameIdTreatment: FrameIdTreatment = 'encode'
): FrameDetailsFromURL {
  if (url) {
    let fileId = url.match(
      /(?<=file|design\/)(.*?)(?=\/)/ // (?<=file|design\/)(.*?)(?=\/)
    )[0];
    let frameId = url.match(/(?<=node-id=)(.*?)(?=&)/)[0];

    console.log(fileId);
    console.log(frameId);

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

/**
 * Generates a figma URL beign a share or embed one from the file ID and frame ID
 * @param fileId
 * @param frameId
 * @param type
 * @returns
 */
export function generateFigmaURL(
  fileId: string,
  frameId: string,
  type: FigmaURLType
): string {
  if (!fileId || !frameId) {
    return '';
  } else {
    let formatedFrameID = formatFrameIdForURLs(frameId, 'encode');
    if (type == 'embed') {
      return `https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${formatedFrameID}`;
    } else {
      return `https://www.figma.com/design/${fileId}/?&node-id=${formatedFrameID}&mode=design`;
    }
  }
}

/**
 * Transforms a Figma share URL to and embed one
 * @param URL
 * @returns
 */
export function getEmbedURLFromShare(URL: string): string {
  let frameDetails = getDetailsFromFigmaURL(URL, 'encode');
  return `https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${frameDetails.fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${frameDetails.frameId}`;
}

/**
 * A simple validation for Figma URLs
 * @param url
 * @param validationType
 * @returns
 */
export function validateFigmaURL(
  url: string,
  validationType: FigmaURLType = 'share'
) {
  if (validationType == 'share')
    return url.match(
      /(https?:\/\/(.+?\.)?figma\.com\/design|file(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/
    );
  else
    return url.match(
      /(https?:\/\/(.+?\.)?figma\.com\/embed(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/
    );
}
