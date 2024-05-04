import * as React from 'react';
import * as _ from 'lodash';

import {
  AppBar,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Toolbar,
  Tooltip,
} from '@mui/material';

import { Add } from '@mui/icons-material';
import Box from '@mui/material/Box';
import { Editor } from './components/Editor';
import { PluginDataContext } from '../utils/PluginDataContext';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ViewContainer } from './components/ViewContainer';
import { createNewPageJSON } from '../utils/docs/createNewPageJSON';
import { pushNewDataToFigma } from '../utils/editor/pushNewDataToFigma';

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
    //console.log('New active tab!');
    //console.log(newActiveTab);
    
  };

  const handlePageCreation = () => {
    let tempDoc = pluginContext.currentDocData;
    let newPage = createNewPageJSON(tempDoc.pages.length+1);
    tempDoc.pages.push(newPage);
    /*console.log('Page creation');*/
    pushNewDataToFigma(pluginContext, tempDoc);
    pluginContext.setActiveTab(tempDoc.pages.length - 1);
  };

  React.useEffect(() => {
    setTabs([]);
    let tempTabs = [];
    for (let i = 0; i < pluginContext.currentDocData.pages.length; i++) {
      tempTabs.push(
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
        />
      );
    }

    setTabs(tempTabs);
  }, [pluginContext.incomingFigmaChanges, pluginContext.incomingEditorChanges]);

  return (
    <ViewContainer>
      <AppBar elevation={0} color="transparent" sx={{ marginTop: 49 }}>
        <Stack direction="row">
          <Tabs
            value={pluginContext.activeTab}
            variant={tabs ? 'standard' : 'scrollable'} // If we remove this ternary the Tabs component bugs out
            onChange={handleChange}
            aria-label="Pages on the document"
          >
            {tabs}
          </Tabs>
          <Tooltip title={'Add a new page'}>
            <IconButton
              sx={{ margin: 'auto 0' }}
              onClick={() => handlePageCreation()}
            >
              <Add />
            </IconButton>
          </Tooltip>
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
