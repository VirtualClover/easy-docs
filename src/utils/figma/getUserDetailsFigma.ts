import { AuthorUser } from '../constants';

export const getUserDetailsInFigma = (): AuthorUser => {
  return {
    id: figma.currentUser.id,
    name: figma.currentUser.name,
    photoUrl: figma.currentUser.photoUrl,
  };
};
