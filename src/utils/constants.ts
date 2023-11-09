import { OutputData } from '@editorjs/editorjs';

export const PLUGIN_VIEWS = ['INSPECT', 'EDITOR', 'SETTINGS'] as const;
export type PluginViews = (typeof PLUGIN_VIEWS)[number];

export interface PageData extends OutputData {
  frameId?: string;
  docId?: string;
}

export const BASE_FILE_DATA = {
  componentsPageID: '',
  componentFrameID: '',
  headerID: '',
  paragraphID: '',
};
export type BaseFileData = typeof BASE_FILE_DATA;

const DEFAULT_DOC_PAGES: PageData[] = [
  {
    time: new Date().getTime(),
    blocks: [
      {
        type: 'header',
        data: {
          text: 'Frame 1',
          level: 0,
        },
      },
      {
        type: 'paragraph',
        data: {
          text: 'Click here to start editing!',
          level: 1,
        },
      },
    ],
  },
  {
    time: new Date().getTime(),
    blocks: [
      {
        type: 'header',
        data: {
          text: 'Frame 2',
          level: 1,
        },
      },
      {
        type: 'paragraph',
        data: {
          text: 'Click here to start editing! 2',
          level: 1,
        },
      },
    ],
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
  setCurrentDocData: (data) => {},
  navigation: initialNavigation,
  setNavigation: (view) => {},
  loadingState: LOADING_STATES[0] as LoadingStates,
  setLoadingState: (loadingState) => {},
  settings: DEFAULT_SETTINGS,
  setSettings: (settings) => {},
};
export type PluginData = typeof DEFAULT_PLUGIN_DATA;

export const FIGMA_COMPONENT_PREFIX = '.[EASY-DOCS]';
