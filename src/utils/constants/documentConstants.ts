import { BlockData } from './datablocksConstants';
import { OutputData } from '@editorjs/editorjs';

/**
 * The different platforms that can make changes to the document
 */
export type ChangesPlatform = 'figma' | 'editor';

export const UNTITLED_DOC_PLACEHOLDER = 'Untitled Doc';

export type StringFormats = 'figma' | 'html';

export const EMPTY_USER_AUTHOR_DATA = {
  id: '',
  name: '',
  photoUrl: '',
};

export const EMPY_DOC_MAP_ITEM = {
  title: '',
  frameId: '',
};

export type DocMapItem = typeof EMPY_DOC_MAP_ITEM;

export type AuthorUser = typeof EMPTY_USER_AUTHOR_DATA;

export const EMPTY_AUTHOR_DATA = {
  user: EMPTY_USER_AUTHOR_DATA,
  changesMadeIn: 'editor' as ChangesPlatform,
};

export type Author = typeof EMPTY_AUTHOR_DATA;

/**
 * The basic Document data, a page can contain multiple blocks
 */
export interface PageData extends OutputData {
  frameId?: string;
  title: string;
  blocks: BlockData[];
}

export const BASE_COMPONENT_DATA = {
  components: {
    componentsPage: {
      id: '',
    },
    header: {
      id: '',
      levelProp: { key: '', variables: [] },
      contentProp: '',
    },
    paragraph: {
      id: '',
      contentProp: '',
    },
    quote: {
      id: '',
      contentProp: '',
      authorProp: '',
    },
    displayFrame: {
      id: '',
      captionProp: '',
      sourceProp: '',
    },
    dosAndDonts: {
      id: '',
      captionProp: '',
      sourceProp: '',
      typeProp: { key: '', variables: [] },
    },
    brokenLink: {
      id: '',
      captionProp: '',
    },
    list: {
      id: '',
      contentProp: '',
    },
    tableCell: {
      id: '',
      contentProp: '',
      typeProp: { key: '', variables: [''] },
    },
    alert: {
      id: '',
      contentProp: '',
      typeProp: { key: '', variables: [] },
    },
    code: {
      id: '',
      contentProp: '',
    },
    divider: {
      id: '',
    },
    componentDoc: {
      id: '',
      componentSourceProp: '',
    },
    pointer: {
      id: '',
      pointerPosProp: { key: '', variables: [] },
      contentProp: '',
    },
  },
  componentDocSection: '',
  lastGenerated: 0,
};

export type BaseComponentData = typeof BASE_COMPONENT_DATA;
/**
 * The data we store in the file
 */
export const BASE_FILE_DATA = {
  componentData: BASE_COMPONENT_DATA,
};

/**
 * The data we store in the file
 */
export type BaseFileData = typeof BASE_FILE_DATA;

/**
 * The default page content
 */
export const DEFAULT_PAGE_DATA: PageData = {
  blocks: [
    {
      type: 'header',
      lastEdited: Date.now(),
      data: {
        text: 'Page 1',
        level: 1,
      },
      figmaNodeId: '',
    },
    {
      type: 'paragraph',
      lastEdited: Date.now(),
      data: {
        text: 'Click here to start editing!',
      },
      figmaNodeId: '',
    },
  ],
  title: 'Page 1',
};

/**
 * The default document content
 */
export const DEFAULT_DOC_DATA = {
  title: 'New document',
  pages: [DEFAULT_PAGE_DATA],
  sectionId: '',
  author: EMPTY_AUTHOR_DATA,
  lastEdited: Date.now().toString(),
};

/**
 * The basic Document data, a document can contain multiple pages
 */
export type DocData = typeof DEFAULT_DOC_DATA;

export const EMPTY_DOC_OBJECT: DocData = {
  title: '',
  pages: [],
  sectionId: '',
  author: EMPTY_AUTHOR_DATA,
  lastEdited: Date.now().toString(),
};

export interface FigmaPageDocData {
  title: string;
  pageId: string;
  data: DocData[];
}

export interface FigmaFileDocData {
  title: string;
  data: FigmaPageDocData[];
}

//Meta data

export const EMPTY_PAGE_METADATA = {
  title: '',
  frameId: '',
  lastEdited: '',
  fileName: '',
};

export type PageBundleMetaData = typeof EMPTY_PAGE_METADATA;

export const EMPTY_DOCUMENT_METADATA = {
  title: '',
  sectionId: '',
  directoryName: '',
  lastEdited: '', //Contrary to the page and file bundle meta data types this one has a last edited property, since the others are only used when generating export bundles and not in actual document edition
  directory: [] as PageBundleMetaData[],
};

export type DocumentBundleMetaData = typeof EMPTY_DOCUMENT_METADATA;

export const EMPTY_FIGMA_PAGE_BUNDLE_METADATA = {
  title: '',
  generatedAt: '',
  pageId: '',
  directoryName: '',
  directory: [] as DocumentBundleMetaData[],
};

export type FigmaPageBundleMetaData = typeof EMPTY_FIGMA_PAGE_BUNDLE_METADATA;

export const EMPTY_FIGMA_FILE_BUNDLE_METADATA = {
  title: '',
  generatedAt: '',
  directoryName: '',
  directory: [] as FigmaPageBundleMetaData[],
};

export type FigmaFileBundleMetaData = typeof EMPTY_FIGMA_FILE_BUNDLE_METADATA;

export type AnyMetaData =
  | FigmaFileBundleMetaData
  | FigmaPageBundleMetaData
  | DocumentBundleMetaData
  | PageBundleMetaData;

  export type BundleType = 'figmaFile' | 'figmaPage' | 'document' | 'page';

/**
 * The data a document reconciliation returns
 */
export interface Reconciliation {
  data: DocData | PageData;
  changesNumber: number;
}

export interface PageReconciliation {}
