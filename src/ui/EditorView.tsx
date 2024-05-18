import * as React from 'react';
import * as _ from 'lodash';

import {
  AppBar,
  CircularProgress,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { Add } from '@mui/icons-material';
import Box from '@mui/material/Box';
import { Editor } from './components/Editor';
import { EditorSkeleton } from './components/skeletons/EditorSkeleton';
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
    if (newActiveTab < tabs.length) {
      //pluginContext.setActiveTab(newActiveTab);
      console.log(`clicked to change tab to : ${newActiveTab}`);

      parent.postMessage(
        {
          pluginMessage: {
            type: 'select-node',
            id: pluginContext.currentDocData.pages[newActiveTab].frameId,
          },
        },
        '*'
      );
    } else {
      //pluginContext.setActiveTab(0);
      parent.postMessage(
        {
          pluginMessage: {
            type: 'select-node',
            id: pluginContext.currentDocData.pages[0].frameId,
          },
        },
        '*'
      );
      console.log('New active tab!');
    }

    //console.log(newActiveTab);
  };

  const handlePageCreation = () => {
    let tempDoc = pluginContext.currentDocData;
    let newPage = createNewPageJSON(tempDoc.pages.length + 1);
    tempDoc.pages.push(newPage);
    /*console.log('Page creation');*/
    pushNewDataToFigma(pluginContext, tempDoc);
  };

  React.useEffect(() => {
    setTabs([]);
    let tempTabs = [];
    for (let i = 0; i < pluginContext.currentDocData.pages.length; i++) {
      tempTabs.push(
        <Tab
          sx={{
            maxWidth: 150,
            overflow: 'hidden',
            whiteSpace: 'noWrap',
            textOverflow: 'ellipsis',
            display: 'block',
            flexDirection: 'row',
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
      <AppBar elevation={0} color="transparent" sx={{ top: 49 }}>
        <Stack direction="row">
          <Tabs
            value={
              tabs.length > pluginContext.activeTab
                ? pluginContext.activeTab
                : 0
            }
            variant={'scrollable'} // If we remove this ternary the Tabs component bugs out
            scrollButtons={'auto'}
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
        sx={{
          overflow: 'auto',
          flex: 1,
          alignSelf: 'stretch',
          padding: '16px 16px 0 16px',
        }}
      >
        <Editor />
      </Box>
      <Snackbar
        open={pluginContext.incomingFigmaChanges}
        autoHideDuration={1000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Stack
          gap={8}
          alignItems={'center'}
          justifyContent={'center'}
          sx={{ bgcolor: 'grey.900', p: 12, borderRadius: 1 }}
        >
          <Typography sx={{ color: 'grey.50' }} variant="body2">
            Loading the latest figma changes
          </Typography>
          <CircularProgress size={16} />
        </Stack>
      </Snackbar>
    </ViewContainer>
  );
};
