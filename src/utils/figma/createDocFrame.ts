import { DEFAULT_SETTINGS, PluginSettings } from '../constants';

import { BASE_STYLE_TOKENS } from '../../styles/base';
import { resizeSection } from './resizeSection';

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
  frame.layoutMode = 'VERTICAL';
  frame.horizontalPadding = settings.frame.padding;
  frame.minWidth = DEFAULT_SETTINGS.frame.minWidth;
  frame.minHeight = DEFAULT_SETTINGS.frame.minHeight;
  frame.verticalPadding = settings.frame.padding;
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.name = name;
  frame.cornerRadius = BASE_STYLE_TOKENS.units.u16;
  /*createInstance(componentIDs.header).then((mainHeader) => {
    mainHeader.setProperties({ 'value#1:0': name });
    frame.appendChild(mainHeader);
    mainHeader.layoutSizingHorizontal = 'FILL';
  });*/
  //Append frame to parent
  if (parent.children.length) {
    let lastChild = parent.children[parent.children.length - 1];
    frame.x = lastChild.x + lastChild.width + settings.section.docGap;
  } else {
    frame.x = parent.x + settings.section.padding;
  }
  frame.y = parent.y + settings.section.padding;
  parent.appendChild(frame);
  figma.currentPage.selection = [frame];
  //figma.viewport.scrollAndZoomIntoView([frame]);
  return frame;
}
