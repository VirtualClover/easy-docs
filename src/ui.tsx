import './ui.css';

import { DEFAULT_PLUGIN_DATA, PluginData } from './utils/constants/constants';

import App from './ui/App';
import { BASE_STYLE_TOKENS } from './styles/base';
import { convertToPx } from './styles/converToPx';
import { createRoot } from 'react-dom/client';

let PLUGIN_DATA: PluginData = DEFAULT_PLUGIN_DATA;

window.onload = function () {
  //Set config
  parent.postMessage(
    {
      pluginMessage: {
        type: 'load-data',
      },
    },
    '*'
  );
};

// Once settings are loaded, load the UI
onmessage = (event) => {
  if (event.data.pluginMessage.type == 'data-loaded') {
    PLUGIN_DATA.settings = event.data.pluginMessage.data.settings;
    console.log(PLUGIN_DATA.settings);
    PLUGIN_DATA.currentUser = event.data.pluginMessage.data.user;
    const themeMode = document.documentElement.className;
    const wrapper = document.getElementById('plugin-wrapper');
    wrapper.innerHTML = '<main id="app"></main>';
    document.body.style.fontFamily = BASE_STYLE_TOKENS.fontFamily;
    document.body.style.margin = convertToPx(BASE_STYLE_TOKENS.units.u0);

    // Render your React component instead
    const root = createRoot(document.getElementById('app'));
    root.render(<App themeMode={themeMode} initialPluginData={PLUGIN_DATA} />);
  }
};

/*

  document.getElementById('inspect').onclick = () => {
    startLoader();
    parent.postMessage(
      {
        pluginMessage: {
          type: 'start-inspection',
          inspectionType: (
            document.getElementById('inspection-type') as HTMLInputElement
          ).value,
        },
      },
      '*'
    );
  

  document.getElementById('gatherFillStyles').onclick = () => {
    console.log('fillStyles');

    parent.postMessage({ pluginMessage: { type: 'gatherFillStyles' } }, '*');
  };

  document.getElementById('gatherComp').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'gatherComponents' } }, '*');
  };

  document.getElementById('gatherTextStyles').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'gatherTextStyles' } }, '*');
  };

  document.getElementById('gatherGrids').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'gatherGrids' } }, '*');
  };

  */

/*

  onmessage = (event) => {
    document.getElementById('header').style.display = 'none';
    evaluation = event.data.pluginMessage.nodes;
    finalErrorCount = 0;
    finalWarningCount = 0;
    //console.log('got this from the plugin code', event.data.pluginMessage);
    if (document.getElementById('errors')) {
      document.getElementById('errors').remove();
    }
    let evaluationWrapper = document.createElement('div');
    evaluationWrapper.setAttribute('id', 'errors');
    totalNodes = event.data.pluginMessage.totalNodes;

    for (let i = 0; i < evaluation.length; i++) {
      let node = evaluation[i];
      let listWrapper = document.createElement('button');
      let rightWrapper = document.createElement('div');
      //Layer Name
      let layerName = document.createElement('a');
      let layerIcon = document.createElement('i');
      layerIcon.setAttribute('class', `icon ${addLayerIcon(node.type)}`);
      layerIcon.append(node.type === 'TEXT' ? 'T' : '');
      layerName.append(layerIcon);
      layerName.append(`${node.name}`);
      //Error counter
      if (node.errors.length) {
        let errorCounter = document.createElement('small');
        errorCounter.append(`${node.errors.length} ❌`);
        rightWrapper.append(errorCounter);
      }
      //Warning counter
      if (node.warnings.length) {
        let warningCounter = document.createElement('small');
        warningCounter.append(`${node.warnings.length} ⚠️`);
        rightWrapper.append(warningCounter);
      }
      //ExpandIcon
      let expandIcon = document.createElement('i');
      expandIcon.setAttribute('class', 'icon icon--caret-down');
      //Errors details
      let errorDetails = document.createElement('div');
      errorDetails.style.opacity = '1';
      //ButtonWrapper
      let buttonsWrapper = document.createElement('div');
      buttonsWrapper.style.display = 'flex';
      errorDetails.append(buttonsWrapper);
      //Layer link
      let layerLink = document.createElement('button');
      layerLink.append('Select layer');
      layerLink.setAttribute('class', 'button button--primary');
      layerLink.onclick = () => {
        parent.postMessage(
          { pluginMessage: { type: 'select-node', id: node.id } },
          '*'
        );
      };
      buttonsWrapper.append(layerLink);
      //Mark/unmark
      let markButton = document.createElement('button');
      markButton.append('Mark as done');
      markButton.setAttribute('class', 'button button--secondary');
      markButton.onclick = () => {
        if (errorDetails.style.opacity === '1') {
          errorDetails.style.opacity = '.5';
          listWrapper.style.opacity = '.5';
          markButton.textContent = 'Unmark as done';
        } else {
          errorDetails.style.opacity = '1';
          listWrapper.style.opacity = '1';
          markButton.textContent = 'Mark as done';
        }
      };
      buttonsWrapper.append(markButton);
      //Add id
      errorDetails.setAttribute('id', node.id);
      errorDetails.setAttribute('class', 'errorDetails');
      errorDetails.style.height = '0px';
      for (let i = 0; i < node.errors.length; i++) {
        const errorType = node.errors[i];
        errorDetails.append(generateError(errorType));
        finalErrorCount++;
      }
      for (let i = 0; i < node.warnings.length; i++) {
        const warningType = node.warnings[i];
        errorDetails.append(generateError(warningType));
        finalWarningCount++;
      }

      //Accordion action
      listWrapper.onclick = () => {
        let panel = document.getElementById(node.id);
        if (panel.style.height === '0px') {
          panel.style.height = 'auto';
          expandIcon.style.transform = 'rotate(180deg)';
        } else {
          panel.style.height = '0px';
          expandIcon.style.transform = 'rotate(0deg)';
        }
      };

      //Appends
      listWrapper.append(layerName);
      rightWrapper.setAttribute('class', 'rightWrapper');
      rightWrapper.append(expandIcon);
      listWrapper.append(rightWrapper);
      evaluationWrapper.append(listWrapper);
      evaluationWrapper.append(errorDetails);
    }

    //Graph
    let total = document.createElement('small');
    total.append(
      `You have a total of ${finalErrorCount} error(s) and ${finalWarningCount} warning(s).`
    );
    total.setAttribute('id', 'total');
    evaluationWrapper.prepend(total);
    let score = finalErrorCount / totalNodes;
    generateCircularGraph(score);
    document.getElementById('plugin-wrapper').style.display = 'block';
    document.getElementById('graph-wrapper').style.display = 'block';
    document.getElementById('plugin-wrapper').append(evaluationWrapper);
    stopLoader();
  };
};

*/
