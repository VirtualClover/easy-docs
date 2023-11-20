// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

import {
  DEFAULT_DOC_DATA,
  DEFAULT_SETTINGS,
  DocData,
  FrameSettings,
  PageData,
  SectionSettings,
} from './utils/constants';

import { createDocFrame } from './utils/figma/createDocFrame';
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
  parentSection: null,
  stopSendingUpdates: false,
  stopIncomingUpdates: false,
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
    let pluginSettings;
    //Get keys
    pluginInit();
  }

  if (msg.type === 'create-new-doc') {
    createNewDoc();
  }

  if (msg.type === 'node-update') {
    if (!context.stopSendingUpdates) {
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
            figma.ui.postMessage({ type: 'no-node' });
            context.parentSection = null;
            break;
        }

        if (parentSection) {
          figma.ui.postMessage({
            type: 'node-data',
            data: generateJSONFromFigmaContent(parentSection),
          });
          context.parentSection = parentSection;
        }
      } else {
        figma.ui.postMessage({ type: 'no-node' });
        context.parentSection = null;
      }
      console.log('inspect done');
    }
  }

  if (msg.type == 'update-selected-doc') {
    context.stopSendingUpdates = true;
    let data: DocData = msg.data;
    let section: SectionNode = context.parentSection;
    let frame =
    section.children[section.children.length - (msg.editedFrame + 1)];
  frame.remove();
    createDocFrame(
      DEFAULT_SETTINGS.frame,
      context.parentSection.id,
      data.title,
      data.pages[msg.editedFrame]
    );
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
