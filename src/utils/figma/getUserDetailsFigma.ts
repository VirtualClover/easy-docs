import { AuthorUser } from '../constants/constants';

/**
 * Gets the user details from the Figma to create and authro user obj
 * @returns 
 */
export const getUserDetailsInFigma = (): AuthorUser => {
  return {
    id: figma.currentUser.id,
    name: figma.currentUser.name,
    photoUrl: figma.currentUser.photoUrl,
  };
};
