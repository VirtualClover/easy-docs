import { DEFAULT_SETTINGS, PluginSettings } from '../constants';

import { BASE_STYLE_TOKENS } from '../../styles/base';
import { decodeStringForFigma } from '../general/cleanseTextData';
import { setNodeFills } from './setNodeFills';

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
  frame.horizontalPadding = settings.customization.frame.padding;
  frame.minWidth = settings.customization.frame.minWidth;
  frame.minHeight = settings.customization.frame.minHeight;
  frame.verticalPadding = settings.customization.frame.padding;
  setNodeFills(frame, DEFAULT_SETTINGS.customization.palette.background.default);
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.name = decodeStringForFigma(name);
  frame.cornerRadius = BASE_STYLE_TOKENS.units.u16;
  /*createInstance(componentIDs.header).then((mainHeader) => {
    mainHeader.setProperties({ 'value#1:0': name });
    frame.appendChild(mainHeader);
    mainHeader.layoutSizingHorizontal = 'FILL';
  });*/
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
