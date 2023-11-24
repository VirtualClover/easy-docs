import * as React from 'react';
import * as _ from 'lodash';

import { DocData, PluginData, PluginViews } from '../utils/constants';
import { darkTheme, lightTheme } from '../styles/base';

import { Container } from '@mui/material';
import { EditorView } from './EditorView';
import { InspectView } from './InspectView';
import { PluginDataContext } from '../utils/PluginDataContext';
import { PluginTopBar } from './components/PluginTopBar';
import { Settings } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';

interface ComponentProps {
  themeMode: string;
  initialPluginData: PluginData;
}

function decideView(currentView: PluginViews) {
  switch (currentView) {
    case 'INSPECT':
      return <InspectView />;
      break;
    case 'EDITOR':
      return <EditorView />;
      break;
    case 'SETTINGS':
      return <Settings />;
      break;
    default:
      return <InspectView />;
      break;
  }
}

function decideHeader(currentView: PluginViews, docTitle: string) {
  switch (currentView) {
    case 'INSPECT':
      return 'Inspect';
      break;
    case 'EDITOR':
      return docTitle;
      break;
    case 'SETTINGS':
      return 'Settings';
      break;
    default:
      return 'Inspect';
      break;
  }
}

function App({ themeMode, initialPluginData }: ComponentProps) {
  const [view, setView] = React.useState(<InspectView />);
  //Context states
  const [currentDocData, setCurrentDocData] = React.useState(
    initialPluginData.currentDocData
  );
  const [navigation, setNavigation] = React.useState(
    initialPluginData.navigation
  );
  const [loadingState, setLoadingState] = React.useState(
    initialPluginData.loadingState
  );
  const [settings, setSettings] = React.useState(initialPluginData.settings);


  React.useEffect(() => {
    setView(decideView(navigation.currentView));
  }, [navigation.currentView]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (navigation.currentView != 'SETTINGS' && loadingState == 'NONE') {
        parent.postMessage({ pluginMessage: { type: 'node-update' } }, '*');
        onmessage = (event) => {
          switch (event.data.pluginMessage.type) {
            case 'node-data':
              let data: DocData = event.data.pluginMessage.data;
              if (data) {
                if (navigation.currentView == 'INSPECT') {
                  setNavigation({
                    currentView: 'EDITOR',
                    prevView: navigation.currentView,
                  });
                }
                /*if (!_.isEqual(currentDocData, data)) {
                  setCurrentDocData(data);
                }*/
              }
              break;
            case 'no-node':
              if (navigation.currentView == 'EDITOR') {
                setNavigation({
                  currentView: 'INSPECT',
                  prevView: navigation.currentView,
                });
              }
              break;
            default:
              break;
          }
        };
      }
    }, 500);
    return () => clearInterval(interval);
  }, [currentDocData, navigation]);

  return (
    <PluginDataContext.Provider
      value={{
        currentDocData,
        setCurrentDocData,
        navigation,
        setNavigation,
        loadingState,
        setLoadingState,
        settings,
        setSettings,
      }}
    >
      <ThemeProvider theme={themeMode == 'figma-dark' ? darkTheme : lightTheme}>
        <Container
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <PluginTopBar />
          {view}
        </Container>
      </ThemeProvider>
    </PluginDataContext.Provider>
  );
}

export default App;
