// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

import {
  BASE_COMPONENT_DATA,
  DEFAULT_SETTINGS,
  DocData,
  EMPTY_DOC_OBJECT,
} from './utils/constants/constants';

import { createNewDoc } from './utils/figma/createNewDoc';
import { generateFigmaContentFromJSON } from './utils/docs/generateFigmaContentFromJSON';
import { generateJSONFromFigmaContent } from './utils/docs/generateJSONFromFigmaContent';
import { pluginInit } from './utils/figma/pluginInit';
import { pushFigmaUpdates } from './utils/figma/pushFigmaUpdates';
import { selectNode } from './utils/figma/selectNode';
import { createNewDocJSON } from './utils/docs/createNewDocJSON';
import { slowUpdateOutdatedComponentBlocks } from './utils/figma/slowUpdateOutDatedNodes';

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { themeColors: true, width: 600, height: 628 });
figma.skipInvisibleInstanceChildren = true;

let context = {
  //parentSection: null,
  settings: DEFAULT_SETTINGS,
  stopSendingUpdates: false,
  stopIncomingUpdates: false,
  lastFetchDoc: EMPTY_DOC_OBJECT,
  componentData: BASE_COMPONENT_DATA, // Latest data pulled from editor
};

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.

  if (msg.type === 'select-node') {
    let id: SceneNode | any = { id: msg.id };
    selectNode(id);
    figma.ui.postMessage({
      type: 'finished-selecting-node',
    });
    //figma.viewport.scrollAndZoomIntoView([id]);
  }

  if (msg.type === 'get-selected-node') {
    const selection = <any>figma.currentPage.selection[0];
    //console.log(selection);

    figma.ui.postMessage({
      type: 'selected-node-id',
      data: selection.id,
    });
  }

  if (msg.type === 'load-data') {
    //Get keys
    pluginInit(context);
  }

  if (msg.type === 'create-new-doc') {
    context.stopSendingUpdates = true;
    let section: SectionNode;
    console.log(context);
    createNewDoc(
      createNewDocJSON(),
      context.settings,
      context.componentData.lastGenerated
    ).then((s) => {
      section = s;
      generateJSONFromFigmaContent(section, context.settings).then((data) => {
        context.stopSendingUpdates = false;
        context.lastFetchDoc = data;
        figma.ui.postMessage({
          type: 'new-node-data',
          data: context.lastFetchDoc,
        });
      });
    });
  }

  //Push updates from figma
  if (msg.type === 'node-update') {
    if (!context.stopSendingUpdates) {
      pushFigmaUpdates(context).then((res) => {
        if (res.type === 'new-node-data') {
          console.log('push figma updates');
          console.log(res.type);
          console.log(res.data);
        }
        figma.ui.postMessage({
          type: res.type,
          data: res.data,
          selectedFrame: res.selectedFrame,
        });
      });
      //console.log('inspect done');
    }
  }

  //Get updates from editor
  if (msg.type == 'update-selected-doc') {
    context.stopSendingUpdates = true;
    let data: DocData = msg.data;
    let section: BaseNode;
    figma.getNodeByIdAsync(data.sectionId).then((node) => {
      if (data.sectionId) {
        section = node;
        context.lastFetchDoc = data;
        if (section && section.type === 'SECTION') {
          //console.log('generate');

          generateFigmaContentFromJSON(
            data,
            section,
            context.settings,
            context.componentData.lastGenerated
          ).then((m) => {
            let selectedFrame: BaseNode;
            figma.getNodeByIdAsync(msg.editedFrame).then((node) => {
              selectedFrame = node;
              if (selectedFrame && selectedFrame.type === 'FRAME') {
                figma.currentPage.selection = [selectedFrame];
              }

              context.stopSendingUpdates = false;
              figma.ui.postMessage({ type: 'finished-figma-update' });
            });
          });
        }
      }
    });
  }

  if (msg.type === 'update-outdated-components') {
    context.stopSendingUpdates = true;
    slowUpdateOutdatedComponentBlocks(context.componentData).then(() => {
      figma.ui.postMessage({ type: 'close-outdated-overlay' });
      context.stopSendingUpdates = false;
    });
  }

  //figma.ui.postMessage(figkeysAsync());
  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  //figma.closePlugin();
};
