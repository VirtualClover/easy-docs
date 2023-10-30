import { OutputData } from '@editorjs/editorjs';

export const PLUGIN_VIEWS = ['INSPECT', 'EDITOR', 'SETTINGS'] as const;
export type PluginViews = (typeof PLUGIN_VIEWS)[number];

export interface FrameData extends OutputData {
  frameId?: string;
  docId?: string;
}

export type DocData = FrameData[];

export const DEFAULT_DOC_DATA: DocData = [
  {
    time: new Date().getTime(),
    blocks: [
      {
        type: 'header',
        data: {
          text: 'Frame 1',
          level: 1,
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

const settingsPalette = {
  heading: '#000000',
  paragraph: '#333333',
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

export const DEFAULT_SETTINGS = {
  fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
  palette: settingsPalette,
};
export type PluginSettings = typeof DEFAULT_SETTINGS;

export const DEFAULT_PLUGIN_DATA = {
  settings: DEFAULT_SETTINGS,
  currentView: PLUGIN_VIEWS[0],
  currentDocData: DEFAULT_DOC_DATA,
};
export type PluginData = typeof DEFAULT_PLUGIN_DATA;
