export let getIndexFromFrame = (frame: FrameNode, section: SectionNode) => {
  return section.children.map((node) => node.id).indexOf(frame.id);
};
