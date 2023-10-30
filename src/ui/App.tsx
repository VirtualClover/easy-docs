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
import { darkTheme, lightTheme } from '../styles/base';

import Box from '@mui/material/Box';
import { EditorView } from './EditorView';
import { InspectView } from './InspectView';
import { PluginDataContext } from '../utils/PluginDataContext';
import { SettingsOutlined } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';

interface ComponentProps {
  themeMode: string;
  pluginData: PluginData;
}

function decideView(currentView: PluginViews) {
  switch (currentView) {
    case 'INSPECT':
      return <InspectView />;
      break;
    case 'EDITOR':
      return <EditorView />;
      break;
    default:
      return <InspectView />;
      break;
  }
}

function App({ themeMode, pluginData }: ComponentProps) {
  const [view, setView] = React.useState(<InspectView />);

  React.useEffect(() => {
    setView(decideView(pluginData.currentView));
  }, [pluginData.currentView]);

  return (
    <PluginDataContext.Provider value={pluginData}>
      <ThemeProvider theme={themeMode == 'figma-dark' ? darkTheme : lightTheme}>
        <Container
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <AppBar elevation={0} color="inherit">
            <Toolbar variant="dense">
              <Typography
                variant="h4"
                component="div"
                sx={{ flexGrow: 1, ml: 16 }}
              >
                Inspect
              </Typography>
              <IconButton>
                <SettingsOutlined />
              </IconButton>
            </Toolbar>
            <Divider />
          </AppBar>
          {view}
        </Container>
      </ThemeProvider>
    </PluginDataContext.Provider>
  );
}

export default App;

/*


        <Stack style={{ flex: '0 1 auto' }}>
          <Toolbar />
        </Stack>

*/
