import {
  AuthorUser,
  ChangesPlatform,
  DocData,
} from '../constants';

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
