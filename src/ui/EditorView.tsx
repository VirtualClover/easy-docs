import * as React from 'react';
import * as _ from 'lodash';

import {
  AppBar,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Toolbar,
} from '@mui/material';

import { Add } from '@mui/icons-material';
import Box from '@mui/material/Box';
import { Editor } from './components/Editor';
import { PluginDataContext } from '../utils/PluginDataContext';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ViewContainer } from './components/ViewContainer';

function a11yProps(index: number) {
  return {
    id: `menu-tab-${index}`,
    'aria-controls': `menu-tabpanel-${index}`,
  };
}

export const EditorView = () => {
  const [tabs, setTabs] = React.useState([]);
  const pluginContext = React.useContext(PluginDataContext);

  const handleChange = (event: React.SyntheticEvent, newActiveTab: number) => {
    pluginContext.setActiveTab(newActiveTab);
  };

  React.useEffect(() => {
    setTabs([]);
    for (let i = 0; i < pluginContext.currentDocData.pages.length; i++) {
      setTabs(() => [
        <Tab
          sx={{
            maxWidth: 300,
            overflow: 'hidden',
            whiteSpace: 'noWrap',
            textOverflow: 'ellipsis',
            display: 'block',
            flexDirection: 'row',
            flex: 1,
          }}
          label={pluginContext.currentDocData.pages[i].title}
          {...a11yProps(i)}
          key={i}
        />,
      ]);
    }
  }, [pluginContext.incomingFigmaChanges, pluginContext.incomingEditorChanges]);

  return (
    <ViewContainer>
      <Snackbar
        message="Fetching new changes from Figma"
        open={pluginContext.incomingFigmaChanges}
        autoHideDuration={6000}
      />
      <AppBar elevation={0} color="transparent" sx={{ marginTop: 49 }}>
        <Stack direction="row">
          <Tabs
            value={pluginContext.activeTab}
            variant="scrollable"
            scrollButtons="auto"
            onChange={handleChange}
            aria-label="Pages on the document"
            sx={{}}
          >
            {tabs}
          </Tabs>
          <IconButton sx={{ margin: 'auto 0' }}>
            <Add />
          </IconButton>
        </Stack>
        <Divider />
      </AppBar>
      <Stack>
        <Toolbar variant="dense" />
      </Stack>
      <Box
        sx={{ flex: 1, overflow: 'auto', alignSelf: 'stretch', padding: 16 }}
      >
        <Editor />
      </Box>
    </ViewContainer>
  );
};
