/**
 * Determines if a Node can get specs generated
 * @param node
 * @returns
 */
export function nodeCanHaveSpecs(
  node: SceneNode | BaseNode
): node is
  | FrameNode
  | ComponentNode
  | InstanceNode
  | TextNode {
  return (
    node.type === 'FRAME' ||
    node.type === 'COMPONENT' ||
    node.type === 'INSTANCE' ||
    node.type === 'TEXT'
  );
}
