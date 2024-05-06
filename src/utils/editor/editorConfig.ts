import { DisplayFrame } from './customTools/displayFrame/displayFrame';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';

export const EDITOR_TOOLS = {
  paragraph: {
    class: Paragraph,
    inlineToolbar: false,
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
};
