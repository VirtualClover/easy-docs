import { FIGMA_COMPONENT_DATA_KEY, FIGMA_NAMESPACE } from '../../constants';

import { BaseComponentData } from '../../constants/constants';
import { createAlertComponent } from './AlertComponent.figma';
import { createBrokenLinkComponent } from './brokenLinkComponent.figma';
import { createCodeComponent } from './codeComponent.figma';
import { createDisplayFrameComponent } from './displayFrameComponent.figma';
import { createDividerComponent } from './dividerComponent.figma';
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
  componentData: BaseComponentData,
  wholeObjectisMissing: Boolean = true,
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
  await figma
    .getNodeByIdAsync(componentData.components.componentsPage.id)
    .then((node) => {
      currentComponentPage = node;
    });
  if (currentComponentPage) {
    if (figma.currentPage == currentComponentPage) {
      let pages = figma.root.children;
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].id != componentData.components.componentsPage.id) {
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
    createCodeComponent(frame),
    createDividerComponent(frame),
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
    let code = values[9];
    let divider = values[10];
    componentData.components.header = header;
    componentData.components.paragraph = paragraph;
    componentData.components.quote = quote;
    componentData.components.displayFrame = displayFrame;
    componentData.components.dosAndDonts = dosAndDonts;
    componentData.components.brokenLink = brokenLink;
    componentData.components.list = list;
    componentData.components.tableCell = tableCell;
    componentData.components.alert = alert;
    componentData.components.code = code;
    componentData.components.divider = divider;
    componentData.components.componentsPage.id = page.id;
    componentData.lastGenerated = Date.now();
    figma.root.setSharedPluginData(
      FIGMA_NAMESPACE,
      FIGMA_COMPONENT_DATA_KEY,
      JSON.stringify(componentData)
    );
  });
  await page.loadAsync();
  page.appendChild(frame);
}
