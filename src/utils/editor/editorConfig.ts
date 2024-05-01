import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';

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
};
