// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

import { DocData, EMPTY_DOC_OBJECT } from './utils/constants/constants';

import { createNewDoc } from './utils/figma/createNewDoc';
import { generateFigmaContentFromJSON } from './utils/docs/generateFigmaContentFromJSON';
import { generateJSONFromFigmaContent } from './utils/docs/generateJSONFromFigmaContent';
import { pluginInit } from './utils/figma/pluginInit';
import { pushFigmaUpdates } from './utils/figma/pushFigmaUpdates';
import { selectNode } from './utils/figma/selectNode';
import { createNewDocJSON } from './utils/docs/createNewDocJSON';
import { slowUpdateOutdatedComponentBlocks } from './utils/figma/slowUpdateOutDatedNodes';
import {
  FIGMA_CONTEXT_LAST_GENERATED_DOC_KEY,
  FIGMA_CONTEXT_STOP_UPDATES_KEY,
} from './utils/constants';

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { themeColors: true, width: 600, height: 628 });
figma.skipInvisibleInstanceChildren = true;

//let context = INITIAL_PLUGIN_CONTEXT;
figma.clientStorage.setAsync(FIGMA_CONTEXT_STOP_UPDATES_KEY, false);
figma.clientStorage.setAsync(
  FIGMA_CONTEXT_LAST_GENERATED_DOC_KEY,
  EMPTY_DOC_OBJECT
);
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
    pluginInit();
  }

  if (msg.type === 'create-new-doc') {
    //context.stopUpdates = true;
    figma.clientStorage.setAsync(FIGMA_CONTEXT_STOP_UPDATES_KEY, true);
    let section: SectionNode;
    //console.log(context);
    createNewDoc(createNewDocJSON()).then((s) => {
      section = s;
      generateJSONFromFigmaContent(section).then(async (data) => {
        await figma.clientStorage.setAsync(
          FIGMA_CONTEXT_STOP_UPDATES_KEY,
          false
        );
        await figma.clientStorage.setAsync(
          FIGMA_CONTEXT_LAST_GENERATED_DOC_KEY,
          data
        );
        //context.stopUpdates = false;
        //context.lastFetchDoc = data;
        figma.ui.postMessage({
          type: 'new-node-data',
          data: data,
        });
      });
    });
  }

  //Push updates from figma
  if (msg.type === 'node-update') {
    figma.clientStorage.getAsync(FIGMA_CONTEXT_STOP_UPDATES_KEY).then((res) => {
      if (!res) {
        pushFigmaUpdates().then((res) => {
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
      }
    });
  }

  //Get updates from editor
  if (msg.type == 'update-selected-doc') {
    let section: BaseNode;

    figma.clientStorage
      .getAsync(FIGMA_CONTEXT_STOP_UPDATES_KEY)
      .then(async (res) => {
        if (res == false) {
          await figma
            .getNodeByIdAsync(msg.data.sectionId)
            .then(async (node) => {
              figma.clientStorage.setAsync(
                FIGMA_CONTEXT_STOP_UPDATES_KEY,
                true
              );
              //context.stopUpdates = true;
              let data: DocData = msg.data;
              console.log('start-figma-update');
              console.log(msg);
              section = node;
              await figma.clientStorage.setAsync(
                FIGMA_CONTEXT_LAST_GENERATED_DOC_KEY,
                data
              );
              //context.lastFetchDoc = data;
              if (section && section.type === 'SECTION') {
                //console.log('generate');
                section.locked = true;
                generateFigmaContentFromJSON(
                  data,
                  section,
                  msg.editedFrames
                ).then(async (section) => {
                  await figma.clientStorage.setAsync(
                    FIGMA_CONTEXT_STOP_UPDATES_KEY,
                    false
                  );
                  //context.stopUpdates = false;
                  section.locked = false;
                  figma.ui.postMessage({ type: 'finished-figma-update' });
                });
              }
            });
        }
      });
  }

  if (msg.type === 'update-outdated-components') {
    //context.stopUpdates = true;
    figma.clientStorage.setAsync(FIGMA_CONTEXT_STOP_UPDATES_KEY, true);
    slowUpdateOutdatedComponentBlocks().then(async () => {
      figma.ui.postMessage({ type: 'close-outdated-overlay' });
      await figma.clientStorage.setAsync(FIGMA_CONTEXT_STOP_UPDATES_KEY, false);
      //context.stopUpdates = false;
    });
  }

  //figma.ui.postMessage(figkeysAsync());
  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  //figma.closePlugin();
};
