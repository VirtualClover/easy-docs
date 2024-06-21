import { DocData, PluginSettings } from '../constants/constants';

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
  settings: PluginSettings,
  componentVersion: number
): Promise<SectionNode> {
  let parentSection = figma.createSection();
  parentSection.x = figma.viewport.center.x;
  parentSection.y = figma.viewport.center.y;
  parentSection.resizeWithoutConstraints(
    settings.customization.section.padding,
    settings.customization.section.padding
  );
  console.log(componentVersion);
  parentSection.name = data.title;
  setNodeFills(parentSection, settings.customization.section.backgroundColor);
  await generateFigmaContentFromJSON(
    data,
    parentSection,
    settings,
    componentVersion
  );
  return parentSection;
}
