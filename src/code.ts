// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

import { DEFAULT_DOC_DATA, DocData, EMPTY_DOC_OBJECT } from './utils/constants';
import {
  reconcileDocData,
  reconcilePageData,
} from './utils/docs/reconcileData';

import { createNewDoc } from './utils/figma/createNewDoc';
import { generateFigmaContentFromJSON } from './utils/docs/generateFigmaContentFromJSON';
import { generateJSONFromFigmaContent } from './utils/docs/generateJSONFromFigmaContent';
import { pluginInit } from './utils/figma/pluginInit';

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { themeColors: true, width: 600, height: 628 });

let context = {
  //parentSection: null,
  stopSendingUpdates: false,
  stopIncomingUpdates: false,
  lastFetchDoc: EMPTY_DOC_OBJECT, // Latest data pulled from editor
};

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.

  if (msg.type === 'select-node') {
    let id: SceneNode | any = { id: msg.id };
    let pn = figma.currentPage;
    pn.selection = [id];
    figma.viewport.scrollAndZoomIntoView([id]);
  }

  if (msg.type === 'load-data') {
    //Get keys
    pluginInit();
  }

  if (msg.type === 'create-new-doc') {
    let section = createNewDoc(DEFAULT_DOC_DATA);
    context.lastFetchDoc = generateJSONFromFigmaContent(section);
    console.log(context.lastFetchDoc);
    figma.ui.postMessage({
      type: 'new-node-data',
      data: context.lastFetchDoc,
    });
  }

  //Push updates from figma
  if (msg.type === 'node-update') {
    if (!context.stopSendingUpdates) {
      pushFigmaUpdates().then((res) =>
        figma.ui.postMessage({ type: res.type, data: res.data })
      );
      //console.log('inspect done');
    }
  }

  //Get updates from editor
  if (msg.type == 'update-selected-doc') {
    context.stopSendingUpdates = true;
    let data: DocData = msg.data;
    console.log(data);
    let section: BaseNode = data.sectionId && figma.getNodeById(data.sectionId);
    context.lastFetchDoc = data;
    if (section && section.type === 'SECTION') {
      generateFigmaContentFromJSON(data, section);
    }
    context.stopSendingUpdates = false;
  }

  //figma.ui.postMessage(figkeysAsync());
  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  //figma.closePlugin();

  /*
  
    if (msg.type === 'start-inspection') {
    globalThis.firstNode = msg.inspectionType === 'screen' ? true : false;
    globalThis.evaluation = { nodes: [], totalNodes: 0 };
    const selection = <any>figma.currentPage.selection;
    selection.forEach((element) => {});

    figma.ui.postMessage(globalThis.evaluation);
    /onst globalStyles = figma.getLocalPaintStyles();
    const stylesJSON = [];
    for (let i = 0; i < globalStyles.length; i++) {
      stylesJSON.push(globalStyles[i].id);
    }
    //console.log(stylesJSON);
  }
  
  */
};

export async function pushFigmaUpdates() {
  let selection = figma.currentPage.selection[0];
  let parentSection: SectionNode;
  if (selection) {
    switch (selection.type) {
      case 'SECTION':
        parentSection = selection;
        break;
      case 'FRAME':
        if (selection.parent.type == 'SECTION') {
          parentSection = selection.parent;
        }
        break;
      case 'INSTANCE':
        if (selection.parent.type == 'FRAME') {
          if (selection.parent.parent.type == 'SECTION') {
            parentSection = selection.parent.parent;
          }
        }
        break;
      default:
        return { type: 'no-node', data: '' };
        break;
    }

    if (parentSection) {
      let generatedDoc = generateJSONFromFigmaContent(parentSection);
      if (generatedDoc.pages) {
        let reconciliation = reconcileDocData(
          generatedDoc,
          context.lastFetchDoc
        );

        if (reconciliation.changesNumber) {
          context.lastFetchDoc = reconciliation.data;
          return { type: 'new-node-data', data: context.lastFetchDoc };
        } else {
          return { type: 'same-node-data', data: '' };
        }
      }
    }
  }
  return { type: 'no-node', data: '' };
}
