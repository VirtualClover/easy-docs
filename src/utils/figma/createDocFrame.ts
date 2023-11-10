import { DEFAULT_SETTINGS, FrameSettings, PageData } from '../constants';

import { generateFigmaContentFromJSON } from '../docs/generateFigmaContentFromJSON';
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
  parent: string,
  name: string,
  frameData: PageData
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
  generateFigmaContentFromJSON(frameData, frame);
  /*createInstance(componentIDs.header).then((mainHeader) => {
    mainHeader.setProperties({ 'value#1:0': name });
    frame.appendChild(mainHeader);
    mainHeader.layoutSizingHorizontal = 'FILL';
  });*/
  //Append frame to parent
  let parentNode = figma.getNodeById(parent);
  if (parent && nodeSupportsChildren(parentNode)) {
    parentNode.appendChild(frame);
    frame.x = 16;
    frame.y = 16;
    parentNode.resizeWithoutConstraints(
      parentNode.width + (frame.width - parentNode.width) + 32,
      parentNode.height > frame.height + 32
        ? parentNode.height
        : frame.height + 32
    );
  }
}
