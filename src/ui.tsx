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
  if (event.data.pluginMessage && event.data.pluginMessage.type == 'data-loaded') {
    PLUGIN_DATA.settings = event.data.pluginMessage.data.settings;
    //console.log(PLUGIN_DATA.settings);
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
