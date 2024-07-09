import { GuidelineType, StatusType } from './guidelines';
import { TextAlignment, UpperCaseTextAligment } from './properties';

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
  fileId: string;
  frameId: string;
  frameExistsInFile: boolean | undefined;
  caption: string;
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
    | CodeBlockData;
}
