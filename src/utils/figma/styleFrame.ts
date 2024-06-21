import { PluginSettings } from '../constants';
import { decodeStringForFigma } from '../general/cleanseTextData';
import { setNodeFills } from './setNodeFills';
/**
 * Adds the basic styling to a frame
 * @param frame
 * @param settings
 * @param customName
 */
export let styleFrame = (
  frame: FrameNode,
  settings: PluginSettings,
  customName: string = ''
) => {
  frame.layoutMode = 'VERTICAL';
  frame.horizontalPadding = settings.customization.frame.padding;
  frame.minWidth = settings.customization.frame.minWidth;
  frame.minHeight = settings.customization.frame.minHeight;
  frame.verticalPadding = settings.customization.frame.padding;
  setNodeFills(frame, settings.customization.palette.background.default);
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.cornerRadius = 16;
  if (customName) {
    frame.name = decodeStringForFigma(customName);
  }
};
