import { DocData, PluginSettings } from '../constants';

import { generateFigmaContentFromJSON } from '../docs/generateFigmaContentFromJSON';
import { setNodeFills } from './setNodeFills';

export function createNewDoc(data: DocData, settings: PluginSettings) {
  let parentSection = figma.createSection();
  parentSection.resizeWithoutConstraints(
    settings.section.padding,
    settings.section.padding
  );
  parentSection.name = data.title;
  setNodeFills(parentSection, settings.section.backgroundColor);
  generateFigmaContentFromJSON(data, parentSection, settings);
  return parentSection;
}
