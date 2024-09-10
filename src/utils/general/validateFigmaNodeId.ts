/**
 * Validates if a string is a Figma node Id
 * @param id 
 * @returns 
 */
export let validateFigmaNodeId = (id: string) => {
  return id.match(/[0-9]{1,}:[0-9]{1,}/g);
};
