import { PageData } from '../constants/constants';

/**
 * Creates a new page JSON
 * @param arrayNumber - The index of the page to be created in the current document
 * @returns
 */
export const createNewPageJSON = (arrayNumber: number): PageData => {
  let data = {
    blocks: [
      {
        type: 'header',
        lastEdited: Date.now(),
        data: {
          text: `Page ${arrayNumber}`,
          level: 1,
        },
        figmaNodeId: '',
      },
      {
        type: 'paragraph',
        lastEdited: Date.now(),
        data: {
          text: 'Click here to start editing!',
        },
        figmaNodeId: '',
      },
    ],
    title: `Page ${arrayNumber}`,
  };

  return data;
};
