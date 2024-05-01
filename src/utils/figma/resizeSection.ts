import { DEFAULT_SETTINGS, SectionSettings } from '../constants';

export function resizeSection(
  section: SectionNode,
  sectionSettings: SectionSettings = DEFAULT_SETTINGS.section
) {
  setTimeout(() => {
    if (section.children.length) {
      for (let i = 0; i < section.children.length; i++) {
        let child = section.children[i];
  
        if (child.type == 'FRAME') {
          let proposedHeight = child.height + sectionSettings.padding * 2;
          //console.log(child.height);
          //console.log(proposedHeight);
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
