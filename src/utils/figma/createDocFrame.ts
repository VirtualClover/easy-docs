import { PluginSettings } from '../constants';
import { styleFrame } from './styleFrame';

/**
 * Creates a doc frame
 * @param minWidth
 * @param parent
 * @param footer
 * @param logo
 */
export function createDocFrame(
  parent: SectionNode,
  name: string,
  settings: PluginSettings
): FrameNode {
  //Create Frame
  const frame: FrameNode = figma.createFrame();
  styleFrame(frame, settings, name);
  //Append frame to parent
  if (parent.children.length) {
    let lastChild = parent.children[parent.children.length - 1];
    frame.x =
      lastChild.x + lastChild.width + settings.customization.section.docGap;
  } else {
    frame.x = parent.x + settings.customization.section.padding;
  }
  parent.appendChild(frame);
  frame.y = settings.customization.section.padding;
  //figma.viewport.scrollAndZoomIntoView([frame]);
  return frame;
}
