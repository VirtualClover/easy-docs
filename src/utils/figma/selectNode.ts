export const selectNode = (node: SceneNode) => {
  let pn = figma.currentPage;
  pn.selection = [node];
};
