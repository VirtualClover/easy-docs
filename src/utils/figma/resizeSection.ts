import { getPluginSettings } from './getPluginSettings';

/**
 * Resizes a section
 * @param section
 * @param sectionSettings
 */
export function resizeSection(section: SectionNode) {
  let settings = getPluginSettings();
  let sectionSettings = settings.customization.section;

  setTimeout(() => {
    if (section.children.length) {
      for (let i = 0; i < section.children.length; i++) {
        let child = section.children[i];

        if (child.type == 'FRAME') {
          let proposedHeight = child.height + sectionSettings.padding * 2;
          let proposedWidth = child.x + child.width + sectionSettings.docGap;

          section.resizeWithoutConstraints(
            section.width > proposedWidth ? section.width : proposedWidth,
            section.height > proposedHeight ? section.height : proposedHeight
          );
        }
      }
    }
  }, 10);
}
