import { OutputBlockData, OutputData } from '@editorjs/editorjs';

import { BASE_STYLE_TOKENS } from '../styles/base';

export const PLUGIN_VIEWS = ['INSPECT', 'EDITOR', 'SETTINGS'] as const;
export type PluginViews = (typeof PLUGIN_VIEWS)[number];

export type ChangesPlatform = 'figma' | 'editor';

export const EMPTY_USER_AUTHOR_DATA = {
  id: '',
  name: '',
  photoUrl: '',
};

export type AuthorUser = typeof EMPTY_USER_AUTHOR_DATA;

export const EMPTY_AUTHOR_DATA = {
  user: EMPTY_USER_AUTHOR_DATA,
  changesMadeIn: 'editor' as ChangesPlatform,
};

export type Author = typeof EMPTY_AUTHOR_DATA;

export interface PageData extends OutputData {
  frameId?: string;
  title: string;
  blocks: BlockData[];
}

export interface BlockData extends OutputBlockData {
  figmaNodeId?: string;
  lastEdited: number;
}

export const BASE_FILE_DATA = {
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
};
export type BaseFileData = typeof BASE_FILE_DATA;

export const DEFAULT_PAGE_DATA: PageData = {
  blocks: [
    {
      type: 'header',
      lastEdited: Date.now(),
      data: {
        text: 'Page 1',
        level: 1,
      },
    },
    {
      type: 'paragraph',
      lastEdited: Date.now(),
      data: {
        text: 'Click here to start editing!',
      },
    },
  ],
  title: 'Page 1',
};
export const DEFAULT_DOC_DATA = {
  title: 'New document',
  pages: [DEFAULT_PAGE_DATA],
  sectionId: '',
  author: EMPTY_AUTHOR_DATA,
  lastEdited: Date.now().toString(),
};

export type DocData = typeof DEFAULT_DOC_DATA;

export const EMPTY_DOC_OBJECT: DocData = {
  title: '',
  pages: [],
  sectionId: '',
  author: EMPTY_AUTHOR_DATA,
  lastEdited: Date.now().toString(),
};

const frameSettings = {
  minWidth: 1400,
  minHeight: 50,
  padding: 56,
  footer: '',
  logo: '',
};
export type FrameSettings = typeof frameSettings;

export const DEFAULT_HEADING_SIZES = [96, 64, 48, 40, 36, 32];

const sectionSettings = {
  backgroundColor: '#E7EEF1',
  padding: 16,
  docGap: 36,
};
export type SectionSettings = typeof sectionSettings;

export const DEFAULT_SETTINGS = {
  fontFamily: BASE_STYLE_TOKENS.fontFamily,
  palette: BASE_STYLE_TOKENS.palette,
  frame: frameSettings,
  section: sectionSettings,
};
export type PluginSettings = typeof DEFAULT_SETTINGS;

export const LOADING_STATES = ['NONE', 'MINOR', 'MAYOR'] as const;
export type LoadingStates = (typeof LOADING_STATES)[number];

const initialNavigation = {
  currentView: 'INSPECT' as PluginViews,
  prevView: 'INSPECT' as PluginViews,
};
export type navigation = typeof initialNavigation;

export interface Reconciliation {
  data: DocData | PageData;
  changesNumber: number;
}

export interface PageReconciliation {}

export const DEFAULT_PLUGIN_DATA = {
  currentDocData: DEFAULT_DOC_DATA,
  currentUser: EMPTY_USER_AUTHOR_DATA,
  setCurrentUser: (authorUser: AuthorUser) => {},
  setCurrentDocData: (data: DocData) => {},
  navigation: initialNavigation,
  setNavigation: (view) => {},
  loadingState: LOADING_STATES[0] as LoadingStates,
  setLoadingState: (loadingState: LoadingStates) => {},
  settings: DEFAULT_SETTINGS,
  setSettings: (settings: PluginSettings) => {},
  incomingFigmaChanges: false,
  setIncomingFigmaChanges: (state: boolean) => {},
  incomingEditorChanges: false,
  setIncomingEditorChanges: (state: boolean) => {},
  activeTab: 0 as number,
  setActiveTab: (state: number) => {},
  sheetOpen: false,
  setSheetOpen: (state: boolean) => {},
  sheetContent: null,
  setSheetContent: (content: () => JSX.Element) => {},
};
export type PluginData = typeof DEFAULT_PLUGIN_DATA;

export const FIGMA_COMPONENT_PREFIX = '.[EASY-DOCS]';

export const FIGMA_NAMESPACE = 'EasyDocs';
export const FIGMA_LAST_EDITED_KEY = 'lastEdited';



export interface FrameDetailsFromURL {
  frameId: string;
  fileId: string;
}