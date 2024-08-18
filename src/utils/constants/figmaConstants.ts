export const FIGMA_NAMESPACE = 'EasyDocs';
export const FIGMA_COMPONENT_DATA_KEY = 'componentData';
export const FIGMA_PLUGIN_SETTINGS_KEY = 'pluginSettings';
export const FIGMA_LAST_EDITED_KEY = 'lastEdited';
export const FIGMA_COMPONENT_VERSION_KEY = 'componentData';
export const FIGMA_CONTEXT_STOP_UPDATES_KEY = 'easyDocsStopUpdates';
export const FIGMA_CONTEXT_LAST_GENERATED_DOC_KEY = 'easyDocsLastGeneratedDoc';
export const FIGMA_COMPONENT_DOCS_KEY = 'componentDocs';
/**
 * The types of URL Figma can generate
 */
export type FigmaURLType = 'embed' | 'share';
/**
 * The prefix all our Figma components have
 */
export const FIGMA_COMPONENT_PREFIX = '.[EASY-DOCS]';

export interface FrameDetailsFromURL {
  frameId: string;
  fileId: string;
}


export const FIGMA_ENCODED_CHARS = {
    brackets: {
      open: '[[[',
      close: ']]]',
    },
  };