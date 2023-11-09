import {
  DEFAULT_DOC_DATA,
  DEFAULT_SETTINGS,
  FrameSettings,
  SectionSettings,
} from '../constants';

import { createDocFrame } from './createDocFrame';
import { setNodeFills } from './setNodeFills';

export function createNewDoc(
  sectionSettings: SectionSettings = DEFAULT_SETTINGS.section,
  frameSettings: FrameSettings = DEFAULT_SETTINGS.frame
) {
  let parentSection = figma.createSection();
  parentSection.name = DEFAULT_DOC_DATA.title;
  setNodeFills(parentSection, sectionSettings.backgroundColor);
  createDocFrame(
    frameSettings,
    parentSection.id,
    DEFAULT_DOC_DATA.pages[0].blocks[0].data.text
  );
}
