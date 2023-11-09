import * as React from 'react';

import {
  AppBar,
  Container,
  Divider,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import { PluginData, PluginViews } from '../utils/constants';
import { Settings, SettingsOutlined } from '@mui/icons-material';
import { darkTheme, lightTheme } from '../styles/base';

import { EditorView } from './EditorView';
import { InspectView } from './InspectView';
import { PluginDataContext } from '../utils/PluginDataContext';
import { PluginTopBar } from './components/PluginTopBar';
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
  const [pluginHeader, setPluginHeader] = React.useState('Inspect');
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
    setPluginHeader(decideHeader(navigation.currentView, currentDocData.title));
  }, [navigation.currentView]);

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
