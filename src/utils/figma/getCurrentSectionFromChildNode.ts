export let getCurrentSectionFromChildNode = async (
  selection: BaseNode,
  loopLimit: number = 5
): Promise<{
  section: SectionNode | null;
  frame: FrameNode | InstanceNode | null;
  frameIndex: number | null;
}> => {
  let currentParent = selection.parent;
  let frameIndex: number | null = null;
  while (
    loopLimit > 0 &&
    (currentParent.type === 'FRAME' || currentParent.type == 'INSTANCE')
  ) {
    selection = currentParent;
    currentParent = currentParent.parent;
    loopLimit--;
  }

  if (currentParent.type == 'SECTION' && selection.type === 'FRAME') {
    frameIndex = currentParent.children
      .map((node) => node.id)
      .indexOf(selection.id);
    return {
      section: currentParent,
      frame: selection,
      frameIndex,
    };
  } else return { section: null, frame: null, frameIndex };
};
