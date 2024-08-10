import { OutputBlockData, OutputData } from '@editorjs/editorjs';

import { BASE_STYLE_TOKENS } from '../../styles/base';

export const PLUGIN_VIEWS = ['INSPECT', 'EDITOR', 'SETTINGS'] as const;
export type PluginViews = (typeof PLUGIN_VIEWS)[number];

export const ENCODED_CHARS = {
  brackets: {
    open: '[[[',
    close: ']]]',
  },
};

export type ChangesPlatform = 'figma' | 'editor';

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

export interface PageData extends OutputData {
  frameId?: string;
  title: string;
  blocks: BlockData[];
}

export interface BlockData extends OutputBlockData {
  figmaNodeId: string;
  lastEdited: number;
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
  lastGenerated: 0,
};

export type BaseComponentData = typeof BASE_COMPONENT_DATA;

export const BASE_FILE_DATA = {
  componentData: BASE_COMPONENT_DATA,
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
  minHeight: BASE_STYLE_TOKENS.units.u56,
  padding: BASE_STYLE_TOKENS.units.u56,
  footer: '',
  logo: '',
};
export type FrameSettings = typeof frameSettings;

export const DEFAULT_HEADING_SIZES = [
  BASE_STYLE_TOKENS.units.u96,
  BASE_STYLE_TOKENS.units.u64,
  BASE_STYLE_TOKENS.units.u48,
  BASE_STYLE_TOKENS.units.u42,
  BASE_STYLE_TOKENS.units.u36,
  BASE_STYLE_TOKENS.units.u32,
];

export const DEFAULT_STATUSES = [
  'info',
  'success',
  'warning',
  'danger',
] as const;
export type StatusType = (typeof DEFAULT_STATUSES)[number];

export const DEFAULT_GUIDELINES = ['do', 'dont', 'caution'] as const;
export type GuidelineType = (typeof DEFAULT_GUIDELINES)[number];

export const DEFAULT_TABLE_CELL_TYPES = ['header', 'body'] as const;
export type TableCellType = (typeof DEFAULT_TABLE_CELL_TYPES)[number];

const sectionSettings = {
  backgroundColor: BASE_STYLE_TOKENS.palette.surface,
  padding: BASE_STYLE_TOKENS.units.u16,
  docGap: BASE_STYLE_TOKENS.units.u36,
};

export type SectionSettings = typeof sectionSettings;

const customizationSettings = {
  fontFamily: BASE_STYLE_TOKENS.fontFamily,
  palette: BASE_STYLE_TOKENS.palette,
  frame: frameSettings,
  section: sectionSettings,
  key: 'Customization',
};

export type CustomizationSettings = typeof customizationSettings;

const syncSettings = {
  key: 'Sync',
};

export type SyncSettings = typeof syncSettings;

const exportSettings = {
  classNamePrefix: 'ed-',
  comment: 'Generated by the Easy Docs figma plugin',
  key: 'Exports',
  referenceLinks: true,
  md: {
    linkIframes: false,
  },
  html: {
    bodyOnly: false,
    addStyling: true,
  },
  docSite: {},
};

export type ExportSettings = typeof exportSettings;

export const SETTINGS_GROUPS = [
  /*'Customization',*/
  'Exports',
  /*'Sync',*/
  'About',
] as const;
export type SettingsGroups = (typeof SETTINGS_GROUPS)[number];

export const DEFAULT_SETTINGS = {
  customization: customizationSettings,
  sync: syncSettings,
  export: exportSettings,
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

export type ExportFileFormat = 'md' | 'html' | 'json';

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
  sheetZIndex: 0,
  setSheetZIndex: (state: number) => {},
  outdatedComponents: false,
  setOutdatedComponents: (state: boolean) => {},
  lastFormatUsed: 'md' as ExportFileFormat,
  setLastFormatUsed: (format: ExportFileFormat) => {},
};
export type PluginData = typeof DEFAULT_PLUGIN_DATA;

export const FIGMA_COMPONENT_PREFIX = '.[EASY-DOCS]';

export interface FrameDetailsFromURL {
  frameId: string;
  fileId: string;
}
