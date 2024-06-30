import {
  BASE_COMPONENT_DATA,
  DEFAULT_SETTINGS,
  EMPTY_DOC_OBJECT,
} from './constants';

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

export type PluginContext = typeof INITIAL_PLUGIN_CONTEXT;
