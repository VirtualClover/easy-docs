import {
  AnyMetaData,
  BundleType,
  DocumentBundleMetaData,
  FigmaFileBundleMetaData,
  FigmaPageBundleMetaData,
} from '../constants';

export type DocumentIndexReference = {
  index: number;
  path: string;
} | null;
export type IndexReference = {
  index: number[];
  path: string;
  fileName: string;
} | null;

export let getPathInFigmaFile = (
  frameId = '',
  metadata: FigmaFileBundleMetaData,
  currentIndex: number[]
): IndexReference => {
  for (const [fpi, figmaPageMetadata] of metadata.directory.entries()) {
    let reference = getPathInFigmaPage(
      frameId,
      figmaPageMetadata,
      currentIndex
    );
    if (reference != null) {
      let path = reference.path;
      if (currentIndex[2] !== fpi) {
        let fpDir = metadata.directory[fpi];
        path = `../../${fpDir.directoryName}/${
          fpDir.directory[reference.index[1]].directoryName
        }/${reference.fileName}`;
      }
      return {
        index: [...reference.index, fpi],
        path,
        fileName: reference.fileName,
      };
    }
  }

  return null;
};

export let getPathInFigmaPage = (
  frameId = '',
  metadata: FigmaPageBundleMetaData,
  currentIndex: number[]
): IndexReference => {
  for (const [di, documentMetadata] of metadata.directory.entries()) {
    let reference = getPathInDocument(frameId, documentMetadata);
    if (reference != null) {
      let path = reference.path;
      if (currentIndex[1] !== di) {
        path = `../${metadata.directory[di].directoryName}/${path}`;
      }
      return { index: [reference.index, di], path, fileName: reference.path };
    }
  }
  return null;
};

export let getPathInDocument = (
  frameId,
  metadata: DocumentBundleMetaData
): DocumentIndexReference => {
  if (metadata.directory) {
    let index = metadata.directory.findIndex(
      (element) => element.frameId == frameId
    );
    if (index != -1) {
      return {
        index,
        path: `${metadata.directory[index].fileName}`,
      };
    }
  }
  return null;
};

export let getPathFromMetaData = (
  metadata: AnyMetaData,
  bundleType: BundleType,
  frameId: string,
  currentIndex
) => {
  if (metadata && bundleType != 'page' && frameId != '') {
    switch (bundleType) {
      case 'figmaFile':
        return getPathInFigmaFile(
          frameId,
          metadata as FigmaFileBundleMetaData,
          currentIndex
        );
        break;
      case 'figmaPage':
        return getPathInFigmaPage(
          frameId,
          metadata as FigmaPageBundleMetaData,
          currentIndex
        );
        break;
      case 'document':
        return getPathInDocument(frameId, metadata as DocumentBundleMetaData);
        break;
      default:
        return null;
        break;
    }
  }

  return null;
};
