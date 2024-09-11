// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

import { DocData, EMPTY_DOC_OBJECT } from './utils/constants';

import { createNewDoc } from './utils/figma/createNewDoc';
import { generateFigmaContentFromJSON } from './utils/figma/generateFigmaContentFromJSON';
import { generateJSONFromFigmaContent } from './utils/figma/generateJSONFromFigmaContent';
import { pluginInit } from './utils/figma/pluginInit';
import { pushFigmaUpdates } from './utils/figma/pushFigmaUpdates';
import { selectNode } from './utils/figma/selectNode';
import { createNewDocJSON } from './utils/docs/createNewDocJSON';
import { slowUpdateOutdatedComponentBlocks } from './utils/figma/slowUpdateOutDatedNodes';
import { setPluginSettings } from './utils/figma/getPluginSettings';
import {
  scanWholeFileForDocuments,
  scanWholePageForDocuments,
} from './utils/figma/scans';
import { handleFigmaError } from './utils/figma/handleFigmaError';

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { themeColors: true, width: 600, height: 628 });
figma.skipInvisibleInstanceChildren = true;

let cachedMsg = null;
let stopUpdates = false;
let lastFetchDoc = EMPTY_DOC_OBJECT;

figma.ui.onmessage = (msg) => {
  if (msg.type) {
    // If statements instead of a switch let's me control the order of events more easily, for example, when there is a cached data that needs to be generated

    //Updates outdated components, or components that were generated directly from grabbing the from the assets panel on Figma
    if (msg.type === 'update-outdated-components') {
      stopUpdates = true;
      slowUpdateOutdatedComponentBlocks().then(async () => {
        figma.ui.postMessage({ type: 'close-outdated-overlay' });
        stopUpdates = false;
      });
    }

    //Updates outdated components, or components that were generated directly from grabbing the from the assets panel on Figma
    if (msg.type === 'update-outdated-components-in-file') {
      stopUpdates = true;
      let file = figma.root;
      figma.loadAllPagesAsync().then(async () => {
        let sections = file.findAllWithCriteria({
          types: ['SECTION'],
        });
        for (const section of sections) {
          await slowUpdateOutdatedComponentBlocks(section);
        }

        figma.ui.postMessage({ type: 'close-outdated-overlay' });
        stopUpdates = false;
      });
    }

    //Scans the current Figma page for Documents
    if (msg.type === 'scan-whole-page-for-docs') {
      let page = figma.currentPage;
      stopUpdates = true;
      scanWholePageForDocuments(page).then((res) => {
        console.log('send page docs');
        setTimeout(() => {
          figma.ui.postMessage({
            type: 'docs-in-page',
            data: res,
          });
          stopUpdates = false;
        }, 500); // Added delays so if there are other messages been sent to the UI they can finsh
      });
    }

    //Scans the current Figma file for documents
    if (msg.type === 'scan-whole-file-for-docs') {
      let file = figma.root;
      scanWholeFileForDocuments(file).then((res) => {
        console.log('send page docs');
        stopUpdates = true;
        setTimeout(() => {
          figma.ui.postMessage({
            type: 'docs-in-file',
            data: res,
          });
          stopUpdates = false;
        }, 500);
      });
    }

    if (msg.type === 'scan-whole-file-for-doc-site') {
      let file = figma.root;
      scanWholeFileForDocuments(file).then((res) => {
        console.log('send page docs');
        stopUpdates = true;
        setTimeout(() => {
          figma.ui.postMessage({
            type: 'docs-in-file-for-doc-site',
            data: res,
          });
          stopUpdates = false;
        }, 500);
      });
    }

    //Selects a node given an ID
    if (msg.type === 'select-node') {
      let id: SceneNode | any = { id: msg.id };
      selectNode(id);
      figma.ui.postMessage({
        type: 'finished-selecting-node',
      });
      //figma.viewport.scrollAndZoomIntoView([id]);
    }

    //Returns the id of the first node of the current selection
    if (msg.type === 'get-selected-node') {
      const selection = <any>figma.currentPage.selection[0];
      //console.log(selection);

      figma.ui.postMessage({
        type: 'selected-node-id',
        data: selection.id,
      });
    }

    //Initializes the plugin
    if (msg.type === 'load-data') {
      pluginInit().catch((e) => handleFigmaError('F1', e));
    }

    //Saves the current settings in the file sotrage
    if (msg.type === 'update-settings') {
      setPluginSettings(msg.settings);
    }

    //Creates a new document
    if (msg.type === 'create-new-doc') {
      stopUpdates = true;

      let section: SectionNode;
      createNewDoc(createNewDocJSON())
        .then((s) => {
          section = s;
          generateJSONFromFigmaContent(section).then(async (res) => {
            stopUpdates = false;
            lastFetchDoc = res.docData;
            figma.viewport.scrollAndZoomIntoView([section]);
            figma.ui.postMessage({
              type: 'new-node-data',
              data: res.docData,
              overrideEditorChanges: res.overrideEditorChanges,
            });
          });
        })
        .catch((e) => handleFigmaError('f5', e));
    }

    //Push updates from Figma to the Editor
    if (msg.type === 'node-update') {
      if (!stopUpdates && cachedMsg == null) {
        stopUpdates = true;
        pushFigmaUpdates(lastFetchDoc).then((res) => {
          if (res.type === 'new-node-data') {
            lastFetchDoc = res.data;
            console.log('push figma updates');
            console.log(res.type);
            console.log(res.data);
          }
          if (res.type === 'no-node') {
            cachedMsg == null;
          }
          stopUpdates = false;
          figma.ui.postMessage(res);
        });
      }
    }

    //Get updates from the Editor
    if (msg.type == 'update-selected-doc' || cachedMsg != null) {
      console.log('msg');
      console.log(msg);

      let section: BaseNode;
      let msgToGenerate;
      let isCached = false;
      if (msg.type == 'update-selected-doc') {
        msgToGenerate = msg;
      } else {
        console.log('cached');
        msgToGenerate = cachedMsg;
        isCached = true;
      }
      if (stopUpdates == false) {
        stopUpdates = true;
        figma
          .getNodeByIdAsync(msgToGenerate.data.sectionId)
          .then(async (node) => {
            //context.stopUpdates = true;
            let data: DocData = msgToGenerate.data;
            lastFetchDoc = data;
            console.log('start-figma-update');
            console.log(msgToGenerate);
            section = node;
            //context.lastFetchDoc = data;
            if (section && section.type === 'SECTION') {
              section.locked = true;
              generateFigmaContentFromJSON(
                data,
                section,
                msgToGenerate.editedFrames,
                msg.reloadFrame
              ).then(async (section) => {
                //context.stopUpdates = false;
                if (isCached && cachedMsg == msgToGenerate) {
                  cachedMsg = null;
                }
                stopUpdates = false;
                section.locked = false;
                figma.ui.postMessage({ type: 'finished-figma-update' });
              });
            }
          });
      } else {
        if (!isCached) {
          cachedMsg = msg;
        }
      }
    }
    //scan-whole-file-for-doc-site
    //figma.closePlugin();
  }
};
