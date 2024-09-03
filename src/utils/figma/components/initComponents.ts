import { BaseComponentData, FIGMA_COMPONENT_DATA_KEY, FIGMA_NAMESPACE } from '../../constants';

import { createAlertComponent } from './AlertComponent.figma';
import { createBrokenLinkComponent } from './brokenLinkComponent.figma';
import { createCodeComponent } from './codeComponent.figma';
import { createComponentDocComponent } from './componentDocComponent.figma';
import { createDisplayFrameComponent } from './displayFrameComponent.figma';
import { createDividerComponent } from './dividerComponent.figma';
import { createDosAndDontsComponent } from './dosAndDontsComponent.figma';
import { createHeaderComponent } from './headerComponent.figma';
import { createListComponent } from './listComponent.figma';
import { createParagraphComponent } from './paragraphComponent.figma';
import { createPointerComponent } from './pointerComponent.figma';
import { createQuoteComponent } from './quoteComponent.figma';
import { createTableCellComponent } from './tableComponent.figma';
import { handleFigmaError } from '../handleFigmaError';
import { setComponentData } from '../getComponentData';

/**
 * Generates a frame to store component doc frames
 * @returns 
 */
export let generateComponentDocsSection = () => {
  //Component documentation frames
  let componentDocSection = figma.createSection();
  componentDocSection.name = '[EASY DOCS DOC FRAMES]';
  return componentDocSection;
}


/**
 * Generates the main components in a Figma file
 * @param componentData
 * @param wholeObjectisMissing
 */
export async function initComponents(
  componentData: BaseComponentData,
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
  //Easy docs components page
  let page = figma.createPage();
  page.name = 'Easy Docs Components';
  let frame = figma.createFrame();
  frame.name = '[EASY DOCS COMPONENTS]';
  frame.layoutMode = 'VERTICAL';
  frame.counterAxisSizingMode = 'AUTO';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.itemSpacing = 90;
  let componentDocSection = generateComponentDocsSection();


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
    createComponentDocComponent(frame),
    createPointerComponent(frame),
  ])
    .then((values) => {
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
      let componentDoc = values[11];
      let pointer = values[12];
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
      componentData.components.componentDoc = componentDoc;
      componentData.components.pointer = pointer;
      componentData.components.componentsPage.id = page.id;
      componentData.componentDocSection =  componentDocSection.id; 
      componentData.lastGenerated = Date.now();
      setComponentData(componentData);
    })
    .catch((e) =>
      handleFigmaError(
        'F3',
        e
      )
    );

  await page.loadAsync();
  page.appendChild(frame);
  page.appendChild(componentDocSection);
  componentDocSection.x = 500;
}
