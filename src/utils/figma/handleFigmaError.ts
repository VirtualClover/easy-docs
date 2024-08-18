//Handles a Figma error
export let handleFigmaError = (
  message: string,
  code: string,
  event: any = null,
  superBreaking: boolean = false
) => {
  let errorMessage = `${message}.(${code})`;
  figma.notify(errorMessage, { error: true });
    console.error(errorMessage,event);
};
