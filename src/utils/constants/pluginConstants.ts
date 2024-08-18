import {
  AuthorUser,
  BASE_COMPONENT_DATA,
  DEFAULT_DOC_DATA,
  DocData,
  EMPTY_DOC_OBJECT,
  EMPTY_USER_AUTHOR_DATA,
} from './documentConstants';

import { BASE_STYLE_TOKENS } from '../../styles/base';
import { ExportFileFormat } from './exportConstants';

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

/**
 * The default export settings
 */
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

export const INITIAL_PLUGIN_CONTEXT = {
  //parentSection: null,
  settings: DEFAULT_SETTINGS,
  stopSendingUpdates: false,
  stopIncomingUpdates: false,
  stopUpdates: false,
  lastFetchDoc: EMPTY_DOC_OBJECT,
  cachedData: EMPTY_DOC_OBJECT,
  componentData: BASE_COMPONENT_DATA, // Latest data pulled from editor
};

export const PLUGIN_VIEWS = ['INSPECT', 'EDITOR', 'SETTINGS'] as const;
export type PluginViews = (typeof PLUGIN_VIEWS)[number];

export type PluginContext = typeof INITIAL_PLUGIN_CONTEXT;

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
  buildingComponentDoc: false,
  setBuildingComponentDoc: (state: boolean) => {},
};
export type PluginData = typeof DEFAULT_PLUGIN_DATA;
