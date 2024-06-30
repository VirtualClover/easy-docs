import { DocData, PluginSettings } from '../constants/constants';

import { generateFigmaContentFromJSON } from '../docs/generateFigmaContentFromJSON';
import { getPluginSettings } from './getPluginSettings';
import { setNodeFills } from './setNodeFills';

/**
 * Creates a new doc on the Figma canvas
 * @param data
 * @param settings
 * @returns
 */
export async function createNewDoc(
  data: DocData,
): Promise<SectionNode> {
  let settings = getPluginSettings();
  let parentSection = figma.createSection();
  parentSection.x = figma.viewport.center.x;
  parentSection.y = figma.viewport.center.y;
  parentSection.resizeWithoutConstraints(
    settings.customization.section.padding,
    settings.customization.section.padding
  );
  parentSection.name = data.title;
  setNodeFills(parentSection, settings.customization.section.backgroundColor);
  await generateFigmaContentFromJSON(
    data,
    parentSection,
  );
  return parentSection;
}
