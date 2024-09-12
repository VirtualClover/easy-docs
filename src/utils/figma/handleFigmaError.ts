import { ERROR_MESSAGES } from "../constants";

//Handles a Figma error
export let handleFigmaError = (
  code: string,
  event: any = null,
  superBreaking: boolean = false
) => {
  let errorMessage = `[Easy Docs]: ${ERROR_MESSAGES[code]}.(${code})`;
  figma.notify(errorMessage, { error: true });
  console.error(errorMessage, 'The details of the error can be found below');
  console.error(event);
  if (superBreaking) {
    figma.closePlugin();
    return;
  }
};
