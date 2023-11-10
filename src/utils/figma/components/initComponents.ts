import { BaseFileData } from '../../constants';
import { createHeaderComponent } from './createHeaderComponent';
import { createParagraphComponent } from './createParagraphComponent';

export async function initComponents(
  componentData: BaseFileData,
  wholeObjectisMissing = true
) {
  figma.notify(
    wholeObjectisMissing
      ? 'Initializing components'
      : 'One or various components were missing, regenerating components',
    {
      timeout: 1500,
    }
  );
  let currentComponentPage = figma.getNodeById(componentData.componentsPage.id);
  if (currentComponentPage) {
    if (figma.currentPage == currentComponentPage) {
      let pages = figma.root.children;
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].id != componentData.componentsPage.id) {
          figma.currentPage = pages[i];
          break;
        }
      }
    }
    currentComponentPage.remove();
  }
  let page = figma.createPage();
  page.name = 'Easy Docs components';
  let frame = figma.createFrame();
  frame.name = '[EASY DOCS COMPONENTS]';
  frame.layoutMode = 'VERTICAL';
  frame.counterAxisSizingMode = 'AUTO';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.itemSpacing = 90;
  await Promise.all([
    createHeaderComponent(frame),
    createParagraphComponent(frame),
  ]).then((values) => {
    componentData.header.id = values[0];
    componentData.paragraph.id = values[1];
    componentData.componentsPage.id = page.id;
    figma.root.setSharedPluginData(
      'EasyDocs',
      'components',
      JSON.stringify(componentData)
    );
  });
  page.appendChild(frame);
}
