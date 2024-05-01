import * as React from 'react';
import * as _ from 'lodash';

import { Box, Container, Typography } from '@mui/material';
import { DocData, PluginData, PluginViews } from '../utils/constants';
import { darkTheme, lightTheme } from '../styles/base';

import { EditorView } from './EditorView';
import { InspectView } from './InspectView';
import { PluginContainer } from './components/PluginContainer';
import { PluginDataContext } from '../utils/PluginDataContext';
import { PluginTopBar } from './components/PluginTopBar';
import { SettingsView } from './SettingsView';
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
      return <SettingsView />;
      break;
    default:
      return <InspectView />;
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
  const [incomingFigmaChanges, setIncomingFigmaChanges] = React.useState(
    initialPluginData.incomingFigmaChanges
  );
  const [incomingEditorChanges, setIncomingEditorChanges] = React.useState(
    initialPluginData.incomingEditorChanges
  );

  const [activeTab, setActiveTab] = React.useState(initialPluginData.activeTab);

  React.useEffect(() => {
    setView(decideView(navigation.currentView));
  }, [navigation.currentView]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (navigation.currentView != 'SETTINGS' && loadingState == 'NONE') {
        parent.postMessage({ pluginMessage: { type: 'node-update' } }, '*');
        onmessage = (event) => {
          switch (event.data.pluginMessage.type) {
            case 'new-node-data':
              let data: DocData = event.data.pluginMessage.data;
              if (data) {
                console.log('stored in the plugin context from figma data:');

                console.log(data);
                setCurrentDocData(data);
                setIncomingFigmaChanges(true);
                if (navigation.currentView == 'INSPECT') {
                  setNavigation({
                    currentView: 'EDITOR',
                    prevView: navigation.currentView,
                  });
                }
              }
              break;

            case 'same-node-data':
              if (navigation.currentView == 'INSPECT') {
                setNavigation({
                  currentView: 'EDITOR',
                  prevView: navigation.currentView,
                });
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

            case 'finished-figma-update':
              setIncomingEditorChanges(false);
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
        incomingFigmaChanges,
        setIncomingFigmaChanges,
        incomingEditorChanges,
        setIncomingEditorChanges,
        activeTab,
        setActiveTab,
      }}
    >
      <ThemeProvider theme={themeMode == 'figma-dark' ? darkTheme : lightTheme}>
        <PluginContainer
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <PluginTopBar />
          {view}
          {process.env.NODE_ENV == 'development' && (
            <Box
              sx={{
                borderWidth: '1 0 1 0',
                p: 8,
                borderColor: `divider`,
                borderStyle: 'solid',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="caption">
                🚧⚠ Development Build - V{process.env.npm_package_version}
              </Typography>
            </Box>
          )}
        </PluginContainer>
      </ThemeProvider>
    </PluginDataContext.Provider>
  );
}

export default App;
