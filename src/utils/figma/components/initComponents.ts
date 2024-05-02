import { BaseFileData } from '../../constants';
import { createHeaderComponent } from './createHeaderComponent';
import { createParagraphComponent } from './createParagraphComponent';
import { createQuoteComponent } from './createQuoteComponent';

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
    createQuoteComponent(frame),
  ]).then((values) => {
    let header = values[0];
    let paragraph = values[1];
    let quote = values[2];
    componentData.header = header;
    componentData.paragraph = paragraph;
    componentData.quote = quote;
    componentData.componentsPage.id = page.id;
    figma.root.setSharedPluginData(
      'EasyDocs',
      'components',
      JSON.stringify(componentData)
    );
  });
  page.appendChild(frame);
}
