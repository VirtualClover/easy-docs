import { BaseFileData } from '../../constants';
import { createDisplayFrameComponent } from './displayFrameComponent';
import { createHeaderComponent } from './headerComponent.figma';
import { createParagraphComponent } from './paragraphComponent.figma';
import { createQuoteComponent } from './quoteComponent.figma';

/**
 * Generates the main components in a Figma file
 * @param componentData
 * @param wholeObjectisMissing
 */
export async function initComponents(
  componentData: BaseFileData,
  wholeObjectisMissing: Boolean = true
) {
  figma.notify(
    wholeObjectisMissing
      ? 'Initializing components'
      : 'One or various components were missing, regenerating components',
    {
      timeout: 1500,
    }
  );
  let currentComponentPage: BaseNode;
  await figma.getNodeByIdAsync(componentData.componentsPage.id).then((node) => {
    currentComponentPage = node;
  });
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
    createDisplayFrameComponent(frame),
  ]).then((values) => {
    let header = values[0];
    let paragraph = values[1];
    let quote = values[2];
    let displayFrame = values[3];
    componentData.header = header;
    componentData.paragraph = paragraph;
    componentData.quote = quote;
    componentData.displayFrame = displayFrame;
    componentData.componentsPage.id = page.id;
    figma.root.setSharedPluginData(
      'EasyDocs',
      'components',
      JSON.stringify(componentData)
    );
  });
  page.appendChild(frame);
}
