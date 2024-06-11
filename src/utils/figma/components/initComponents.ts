import { BaseFileData } from '../../constants';
import { createAlertComponent } from './AlertComponent.figma';
import { createBrokenLinkComponent } from './brokenLinkComponent.figma';
import { createDisplayFrameComponent } from './displayFrameComponent.figma';
import { createDosAndDontsComponent } from './dosAndDontsComponent.figma';
import { createHeaderComponent } from './headerComponent.figma';
import { createListComponent } from './listComponent.figma';
import { createParagraphComponent } from './paragraphComponent.figma';
import { createQuoteComponent } from './quoteComponent.figma';
import { createTableCellComponent } from './tableComponent.figma';

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
    createDosAndDontsComponent(frame),
    createBrokenLinkComponent(frame),
    createListComponent(frame),
    createTableCellComponent(frame),
    createAlertComponent(frame),
  ]).then((values) => {
    let header = values[0];
    let paragraph = values[1];
    let quote = values[2];
    let displayFrame = values[3];
    let dosAndDonts = values[4];
    let brokenLink = values[5];
    let list = values[6];
    let tableCell = values[7];
    let alert = values[8];
    componentData.header = header;
    componentData.paragraph = paragraph;
    componentData.quote = quote;
    componentData.displayFrame = displayFrame;
    componentData.dosAndDonts = dosAndDonts;
    componentData.brokenLink = brokenLink;
    componentData.list = list;
    componentData.tableCell = tableCell;
    componentData.alert = alert;
    componentData.componentsPage.id = page.id;
    figma.root.setSharedPluginData(
      'EasyDocs',
      'components',
      JSON.stringify(componentData)
    );
  });
  await page.loadAsync();
  page.appendChild(frame);
}
