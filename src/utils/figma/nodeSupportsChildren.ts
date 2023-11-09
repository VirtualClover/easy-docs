/**
 * Determines if a Node can support children
 * @param node
 * @returns
 */
export function nodeSupportsChildren(
  node: SceneNode | BaseNode
): node is FrameNode | ComponentNode | InstanceNode | BooleanOperationNode {
  return (
    node.type === 'FRAME' ||
    node.type === 'GROUP' ||
    node.type === 'COMPONENT' ||
    node.type === 'INSTANCE' ||
    node.type === 'BOOLEAN_OPERATION' ||
    node.type === 'SECTION'
  );
}
