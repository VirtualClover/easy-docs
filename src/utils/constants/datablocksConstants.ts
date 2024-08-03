import {
  AnatomySpecs,
  LayerSpecs,
  TextAlignment,
  UpperCaseTextAligment,
} from './properties';
import { GuidelineType, StatusType } from './guidelines';

import { OutputBlockData } from '@editorjs/editorjs';

export interface ParagraphBlockData {
  text: string;
}

export interface HeaderBlockData {
  level: number;
  text: string;
}

export interface QuoteBlockData {
  text: string;
  caption: string;
  alignment: TextAlignment;
}

export interface AlertBlockData {
  message: string;
  type: StatusType;
  align: TextAlignment | UpperCaseTextAligment;
}

export interface DisplayFrameBlockData {
  fileId?: string;
  frameId: string;
  frameExistsInFile: boolean | undefined;
  caption: string;
  maxHeight?: number;
}

export interface DosAndDontsBlockData {
  fileId: string;
  frameId: string;
  frameExistsInFile: boolean | undefined;
  type: GuidelineType;
  caption: string;
}

export interface ListBlockData {
  style: 'unordered' | 'ordered';
  items: string[];
}

export interface TableBlockData {
  withHeadings: boolean;
  content: string[][];
}

export interface CodeBlockData {
  code: string;
}

export interface ComponentDocumentation {
  componentToDocument:
    | {
        id: string;
        name: string;
      }
    | undefined;
  fileId: string;
  frameExistsInFile: boolean | undefined;
  frameId: string;
  specs: LayerSpecs[];
}

export const EMPTY_LAYER_PROPERTIES: AnatomySpecs = {
  width: { value: null, source: 'rawValue' },
  height: { value: null, source: 'rawValue' },
  fills: { value: null, source: 'rawValue' },
  minHeight: { value: null, source: 'rawValue' },
  minWidth: { value: null, source: 'rawValue' },
  maxHeight: { value: null, source: 'rawValue' },
  maxWidth: { value: null, source: 'rawValue' },
  typography: { value: null, source: 'rawValue' },
  itemSpacing: { value: null, source: 'rawValue' },
  cornerRadius: { value: null, source: 'rawValue' },
  topLeftRadius: { value: null, source: 'rawValue' },
  topRightRadius: { value: null, source: 'rawValue' },
  bottomLeftRadius: { value: null, source: 'rawValue' },
  bottomRightRadius: { value: null, source: 'rawValue' },
  fontName: { value: null, source: 'rawValue' },
  fontSize: { value: null, source: 'rawValue' },
  fontWeight: { value: null, source: 'rawValue' },
  lineHeight: { value: null, source: 'rawValue' },
  textDecoration: { value: null, source: 'rawValue' },
  letterSpacing: { value: null, source: 'rawValue' },
  strokeWeight: { value: null, source: 'rawValue' },
  strokeTopWeight: { value: null, source: 'rawValue' },
  strokeRightWeight: { value: null, source: 'rawValue' },
  strokeBottomWeight: { value: null, source: 'rawValue' },
  strokeLeftWeight: { value: null, source: 'rawValue' },
  strokes: { value: null, source: 'rawValue' },
  paddingTop: { value: null, source: 'rawValue' },
  paddingRight: { value: null, source: 'rawValue' },
  paddingLeft: { value: null, source: 'rawValue' },
  paddingBottom: { value: null, source: 'rawValue' },
  opacity: { value: null, source: 'rawValue' },
};

export const EMPTY_LAYER_SHARED_DATA = {
  layerName: '',
  layerType: '',
  properties: null,
};

export type LayerSharedData = typeof EMPTY_LAYER_SHARED_DATA;

export const EMPTY_VARIANT_SHARED_DATA = {
  variantId: '',
  variantName: '',
  layers: [] as LayerSharedData[],
  displayFrame: {
    id: '',
    existsInFile: undefined,
  },
};
export type VariantSharedData = typeof EMPTY_VARIANT_SHARED_DATA;

export const EMPTY_COMPONENT_SHARED_DATA = {
  mainComponentId: '',
  mainComponentName: '',
  anatomyFramesWrapper: {
    id: '',
    existsInFile: undefined,
  },
  documentationFrame: {
    id: '',
    existsInFile: undefined,
  },
  fileId: '',
  variants: [] as VariantSharedData[],
};
export type ComponentSharedData = typeof EMPTY_COMPONENT_SHARED_DATA;

export interface ComponentDocBlockData extends ComponentSharedData {}

export interface BlockData extends OutputBlockData {
  figmaNodeId: string;
  lastEdited: number;
  data:
    | ParagraphBlockData
    | HeaderBlockData
    | QuoteBlockData
    | AlertBlockData
    | DisplayFrameBlockData
    | DosAndDontsBlockData
    | ListBlockData
    | TableBlockData
    | CodeBlockData
    | ComponentDocBlockData;
}
