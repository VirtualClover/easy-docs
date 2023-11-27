import { DEFAULT_SETTINGS, FrameSettings, PageData } from '../constants';

import { NodeWithChildren } from './ExtendedNodeTypings';
import { nodeSupportsChildren } from './nodeSupportsChildren';

/**
 * Creates a doc frame
 * @param minWidth
 * @param parent
 * @param footer
 * @param logo
 */
export function createDocFrame(
  frameSettings: FrameSettings = DEFAULT_SETTINGS.frame,
  parent: SectionNode,
  name: string
) {
  //Create Frame
  const frame: FrameNode = figma.createFrame();
  frame.layoutMode = 'VERTICAL';
  frame.horizontalPadding = frameSettings.padding;
  frame.minWidth = DEFAULT_SETTINGS.frame.minWidth;
  frame.minHeight = DEFAULT_SETTINGS.frame.minHeight;
  frame.verticalPadding = frameSettings.padding;
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.name = name;
  /*createInstance(componentIDs.header).then((mainHeader) => {
    mainHeader.setProperties({ 'value#1:0': name });
    frame.appendChild(mainHeader);
    mainHeader.layoutSizingHorizontal = 'FILL';
  });*/
  //Append frame to parent
  parent.appendChild(frame);
  frame.x = 16;
  frame.y = 16;
  parent.resizeWithoutConstraints(
    parent.width + (frame.width - parent.width) + 32,
    parent.height > frame.height + 32 ? parent.height : frame.height + 32
  );
  figma.currentPage.selection = [frame];
  //figma.viewport.scrollAndZoomIntoView([frame]);
  return frame;
}
