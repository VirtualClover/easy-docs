import { AuthorUser, ChangesPlatform, DocData, UNTITLED_DOC_PLACEHOLDER } from '../constants';

/**
 * Formats a doc data, mostly the date an the author
 * @param data
 * @param changesMadeIn
 * @param user
 */
export const formatDocData = (
  data: DocData,
  changesMadeIn: ChangesPlatform,
  user: AuthorUser
) => {
  data.author = {
    changesMadeIn,
    user,
  };
  if (!data.title){
    data.title == UNTITLED_DOC_PLACEHOLDER;
  };
  data.lastEdited = Date.now().toString();
};
