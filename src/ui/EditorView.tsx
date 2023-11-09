import * as React from 'react';

import { AppBar, Divider, IconButton, Stack, Toolbar } from '@mui/material';

import { Add } from '@mui/icons-material';
import Box from '@mui/material/Box';
import { DEFAULT_DOC_DATA } from '../utils/constants';
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
  const [activeTab, setActiveTab] = React.useState(0);
  const [tabs, setTabs] = React.useState([]);
  const pluginContext = React.useContext(PluginDataContext);
  const [editorData, setEditorData] = React.useState(DEFAULT_DOC_DATA.pages[0]);

  const handleChange = (event: React.SyntheticEvent, newActiveTab: number) => {
    setActiveTab(newActiveTab);
  };

  React.useEffect(() => {
    for (let i = 0; i < pluginContext.currentDocData.pages.length; i++) {
      setTabs((currentTabs) => [
        ...currentTabs,
        <Tab
          label={pluginContext.currentDocData.pages[i].blocks[0].data.text}
          {...a11yProps(i)}
          key={i}
        />,
      ]);
    }

    console.log('Loaded editor view');
  }, [pluginContext.currentDocData]);

  React.useEffect(() => {
    setEditorData(pluginContext.currentDocData.pages[activeTab]);
  }, [activeTab]);

  return (
    <ViewContainer>
      <AppBar elevation={0} color="inherit" sx={{ marginTop: 49 }}>
        <Stack direction="row">
          <Tabs
            value={activeTab}
            onChange={handleChange}
            aria-label="basic tabs example"
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
        <Editor data={editorData} />
      </Box>
    </ViewContainer>
  );
};
