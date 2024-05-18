import { DocData, PluginSettings } from '../constants';

import { generateFigmaContentFromJSON } from '../docs/generateFigmaContentFromJSON';
import { setNodeFills } from './setNodeFills';

/**
 * Creates a new doc on the Figma canvas
 * @param data
 * @param settings
 * @returns
 */
export async function createNewDoc(
  data: DocData,
  settings: PluginSettings
): Promise<SectionNode> {
  let parentSection = figma.createSection();
  parentSection.resizeWithoutConstraints(
    settings.section.padding,
    settings.section.padding
  );
  parentSection.name = data.title;
  setNodeFills(parentSection, settings.section.backgroundColor);
  await generateFigmaContentFromJSON(data, parentSection, settings);
  return parentSection;
}
