import { ERROR_MESSAGES } from '../constants';

//Handles an Editor error
export let handleEditorError = (
  code: string,
  event: any = null,
  setShowErrorHook,
  setErrorMessageHook
) => {
  let errorMessage = `[Easy Docs]: ${ERROR_MESSAGES[code]}.(${code})`;
  if (event) {
    console.error(errorMessage, 'The details of the error can be found below');
    console.error(event);
  }
  setShowErrorHook(true);
  setErrorMessageHook(`${ERROR_MESSAGES[code]}.(${code})`);
};
