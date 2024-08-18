import { PluginSettings } from '../constants';
import { styleFrame } from './styleFrame';

/**
 * Creates a doc frame
 * @param minWidth
 * @param parent
 * @param footer
 * @param logo
 */
export function createPageFrame(
  parent: SectionNode,
  name: string,
  settings: PluginSettings
): FrameNode {
  //Create Frame
  const frame: FrameNode = figma.createFrame();
  parent.appendChild(frame);
  styleFrame(frame, settings, name);
  //Append frame to parent
  // If theres elements in the array it is becasue the frame is not the first one
  if (parent.children.length > 1) {
    let lastChild = parent.children[parent.children.length - 2];
    frame.x =
      lastChild.x + lastChild.width + settings.customization.section.docGap;
  } else {
    frame.x = settings.customization.section.padding;
  }
  frame.y = settings.customization.section.padding;
  //figma.viewport.scrollAndZoomIntoView([frame]);
  return frame;
}
