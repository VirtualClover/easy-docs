import { FigmaURLType } from '../constants';
import { FrameDetailsFromURL } from '../constants';

type FrameIdTreatment = 'encode' | 'decode';

/**
 * A simple validation for Figma URLs
 * @param url
 * @param validationType
 * @returns
 */
export function validateFigmaURL(
  url: string | boolean,
  validationType: FigmaURLType | 'both' = 'share'
): false | RegExpMatchArray {
  if (url && typeof url == 'string') {
    switch (validationType) {
      case 'share':
        return url.match(
          /(https?:\/\/(.+?\.)?figma\.com\/design|file(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/
        );
        break;
      case 'embed':
        return url.match(
          /(https?:\/\/(.+?\.)?figma\.com\/embed(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/
        );
        break;
      default:
        return url.match(
          /(https?:\/\/(.+?\.)?figma\.com\/design|file|embed(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)/
        );
        break;
    }
  }
  return false;
}

/**
 * Formats the frame ID for a specific URL
 * @param id
 * @param treatment Encode for url or decode from url
 * @returns
 */
export function formatFrameIdForURLs(
  id: string,
  treatment: FrameIdTreatment = 'encode'
): string {
  if (treatment == 'decode') {
    return id.replace(/%3A|-/, ':');
  } else {
    return id.replace(':', '-');
  }
}

/**
 * Extracts the frame and file ID from the figma share URL
 * @param url
 * @param frameIdTreatment
 * @returns
 */
export function getDetailsFromFigmaURL(
  url: string | boolean,
  frameIdTreatment: FrameIdTreatment = 'encode'
): FrameDetailsFromURL {
  if (url && typeof url == 'string' && validateFigmaURL(url)) {
    url = cleanURL(url);
    let fileMatch = url.match(
      /(?<=file|design\/)(.*?)(?=\/)/ // (?<=file|design\/)(.*?)(?=\/)
    );
    let frameMatch = url.match(/(?<=node-id=)(.*?)(?=(&|\?))/);
    let fileId = fileMatch ? fileMatch[0] : '';
    let frameId = frameMatch ? frameMatch[0] : '';

    if (fileId && frameId) {
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
      return `https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${fileId}%2F%3Ftype%3Ddesign%26node-id%3D${formatedFrameID}`;
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
export function getEmbedURLFromShare(url: string): string {
  if (url && validateFigmaURL(url)) {
    url = cleanURL(url);
    let frameDetails = getDetailsFromFigmaURL(url, 'encode');
    return `https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${frameDetails.fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${frameDetails.frameId}`;
  } else {
    return '';
  }
}

/**
 * Removes blank spaces from a URL
 * @param url
 * @returns
 */
export function cleanURL(url: string): string {
  return url.replace(/^\s+|\s+$|\s+(?=\s)/g, '');
}
