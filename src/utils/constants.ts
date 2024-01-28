import { OutputBlockData, OutputData } from '@editorjs/editorjs';

export const PLUGIN_VIEWS = ['INSPECT', 'EDITOR', 'SETTINGS'] as const;
export type PluginViews = (typeof PLUGIN_VIEWS)[number];

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
};
export type BaseFileData = typeof BASE_FILE_DATA;

const DEFAULT_DOC_PAGES: PageData[] = [
  {
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
        type: 'header',
        lastEdited: Date.now(),
        data: {
          text: 'Subtitle',
          level: 2,
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
  },
];
export const DEFAULT_DOC_DATA = {
  title: 'New document',
  pages: DEFAULT_DOC_PAGES,
};
export type DocData = typeof DEFAULT_DOC_DATA;

const settingsPalette = {
  heading: '#000000',
  paragraph: '#626262',
  do: '#BBFFCE',
  dont: '#FFA1C9',
  caution: '#FBF4BB',
  successCallout: '#BBFFCE',
  waringCallout: '#FBF4BB',
  infoCallout: '#AFD8FE',
  errorCallout: '#FFA1C9',
  divider: '#B2B2B2',
};
export type SettingPalette = typeof settingsPalette;

const frameSettings = {
  minWidth: 1400,
  minHeight: 50,
  padding: 40,
  footer: '',
  logo: '',
};
export type FrameSettings = typeof frameSettings;

export const DEFAULT_HEADING_SIZES = [96, 64, 48, 40, 36, 32];

const sectionSettings = {
  backgroundColor: '#E7EEF1',
};
export type SectionSettings = typeof sectionSettings;

export const DEFAULT_SETTINGS = {
  fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
  palette: settingsPalette,
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

export const DEFAULT_PLUGIN_DATA = {
  currentDocData: DEFAULT_DOC_DATA,
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
};
export type PluginData = typeof DEFAULT_PLUGIN_DATA;

export const FIGMA_COMPONENT_PREFIX = '.[EASY-DOCS]';

export const FIGMA_NAMESPACE = 'EasyDocs';
export const FIGMA_LAST_EDITED_KEY = 'lastEdited';
