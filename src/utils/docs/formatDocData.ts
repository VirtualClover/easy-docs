import { AuthorUser, ChangesPlatform, DocData } from '../constants/constants';

/**
 * Formats a doc data, mostyl the date an the author
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
  data.lastEdited = Date.now().toString();
};
