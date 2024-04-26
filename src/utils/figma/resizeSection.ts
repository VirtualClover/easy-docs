import { DEFAULT_SETTINGS, SectionSettings } from '../constants';

export function resizeSection(
  section: SectionNode,
  sectionSettings: SectionSettings = DEFAULT_SETTINGS.section
) {
  if (section.children.length) {
    let lastChild = section.children[section.children.length - 1];

    let proposedHeight = lastChild.height + sectionSettings.padding * 2;
    let proposedWidth = lastChild.x + lastChild.width + sectionSettings.docGap;

    section.resizeWithoutConstraints(
      section.width + lastChild.width + sectionSettings.docGap,
      section.height > proposedHeight ? section.height : proposedHeight
    );
  }
}
