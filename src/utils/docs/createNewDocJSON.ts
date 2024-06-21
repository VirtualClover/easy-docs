import { DocData, EMPTY_AUTHOR_DATA } from '../constants/constants';

import { createNewPageJSON } from './createNewPageJSON';

/**
 * Creates a new page JSON
 * @param arrayNumber
 * @returns
 */
export const createNewDocJSON = (): DocData => {
  let data: DocData = {
    title: `New document`,
    pages: [createNewPageJSON(1)],
    author: EMPTY_AUTHOR_DATA,
    lastEdited: Date.now().toString(),
    sectionId: '',
  };

  return data;
};
