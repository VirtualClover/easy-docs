// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

import { initComponents } from './utils/figma/components/initComponents';
import { createNewDoc } from './utils/figma/createNewDoc';
import { pluginInit } from './utils/figma/pluginInit';

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { themeColors: true, width: 600, height: 628 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.

  if (msg.type === 'start-inspection') {
    globalThis.firstNode = msg.inspectionType === 'screen' ? true : false;
    globalThis.evaluation = { nodes: [], totalNodes: 0 };
    const selection = <any>figma.currentPage.selection;
    selection.forEach((element) => {});

    figma.ui.postMessage(globalThis.evaluation);
    /*const globalStyles = figma.getLocalPaintStyles();
    const stylesJSON = [];
    for (let i = 0; i < globalStyles.length; i++) {
      stylesJSON.push(globalStyles[i].id);
    }*/
    //console.log(stylesJSON);
  }

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
    if (
      figma.currentPage.selection[0] &&
      figma.currentPage.selection[0].type == 'COMPONENT'
    ) {
      console.log(figma.currentPage.selection[0].key);
    }
  }

  //figma.ui.postMessage(figkeysAsync());
  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  //figma.closePlugin();
};
