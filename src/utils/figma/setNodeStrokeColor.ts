import { clone } from '../general/clone';

/**
 * Sets the stroke color of a specific node
 * @param node
 * @param fill
 */
export function setNodeStrokeColor(node, color: string) {
  const fills = clone(node.strokes);
  fills[0] = figma.util.solidPaint(color, fills[0]);
  node.strokes = fills;
}
