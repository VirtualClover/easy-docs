import {
  DEFAULT_DOC_DATA,
  DEFAULT_SETTINGS,
  DocData,
  FrameSettings,
  SectionSettings,
} from '../constants';

import { createDocFrame } from './createDocFrame';
import { generateFigmaContentFromJSON } from '../docs/generateFigmaContentFromJSON';
import { setNodeFills } from './setNodeFills';

export function createNewDoc(
  data: DocData,
  sectionSettings: SectionSettings = DEFAULT_SETTINGS.section,
  frameSettings: FrameSettings = DEFAULT_SETTINGS.frame
) {
  let parentSection = figma.createSection();
  parentSection.name = DEFAULT_DOC_DATA.title;
  setNodeFills(parentSection, sectionSettings.backgroundColor);
  generateFigmaContentFromJSON(data, parentSection);
}
