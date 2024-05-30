import { clone } from '../clone';

/**
 * Sets the fills of a specific node
 * @param node
 * @param fill
 */
export function setNodeFills(node, fill: string) {
  const fills = clone(node.fills);
  fills[0] = figma.util.solidPaint(fill, fills[0]);
  fills[0].visible = true;
  node.fills = fills;
}