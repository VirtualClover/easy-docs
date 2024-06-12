import { DisplayFrame } from './customTools/displayFrame';
import { DosAndDonts } from './customTools/dosAndDonts';
import { Divider } from './customTools/divider';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import List from '@editorjs/list';
import Table from '@editorjs/table';
import Alert from 'editorjs-alert';
import Code from '@editorjs/code';

/**
 * The base editor config
 */
export const EDITOR_TOOLS = {
  paragraph: {
    class: Paragraph,
  },
  header: {
    class: Header,
    config: {
      placeholder: 'Enter a header',
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: 'Enter a quote',
      captionPlaceholder: "Quote's author",
    },
  },
  displayFrame: {
    class: <any>DisplayFrame,
  },
  dosAndDonts: {
    class: <any>DosAndDonts,
  },
  list: {
    class: List,
    inlineToolbar: true,
    config: {
      defaultStyle: 'unordered',
    },
  },
  table: {
    class: Table,
    inlineToolbar: true,
    config: {
      rows: 1,
      cols: 1,
    },
  },
  alert: {
    class: Alert,
    inlineToolbar: false,
    config: {
      alertTypes: ['info', 'success', 'warning', 'danger'],
      defaultType: 'info',
      messagePlaceholder: 'Enter a message!',
    },
  },
  code: {
    class: Code,
    placeholder: 'Add your code snippet here!',
  },
  divider: {
    class: <any>Divider,
  },
};
