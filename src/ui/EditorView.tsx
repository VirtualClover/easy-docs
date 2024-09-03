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
} from '@mui/material';

import { Add } from '@mui/icons-material';
import Box from '@mui/material/Box';
import { Editor } from './components/Editor';
import { OutDatedComponentsView } from './components/OutdatedComponentsView';
import { PluginDataContext } from '../utils/constants/PluginDataContext';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ViewContainer } from './components/ViewContainer';
import { createNewPageJSON } from '../utils/docs/createNewPageJSON';
import { decodeStringForFigma } from '../utils/general/cleanseTextData';
import { pushNewDataToFigma } from '../utils/editor/pushNewDataToFigma';
import { selectNewPageFromEditor } from '../utils/editor/selectNewPageFromEditor';

function a11yProps(index: number) {
  return {
    id: `menu-tab-${index}`,
    'aria-controls': `menu-tabpanel-${index}`,
  };
}

export const EditorView = () => {
  const [tabs, setTabs] = React.useState([]);
  const [key, setKey] = React.useState(1); // Use to trigger a reload for the editor and tabs component
  const pluginContext = React.useContext(PluginDataContext);
  const [mountedSectionId, setMountedSectionId] = React.useState(
    pluginContext.currentDocData.sectionId
  );

  const handleChange = (event: React.SyntheticEvent, newActiveTab: number) => {
    if (newActiveTab < tabs.length) {
      //pluginContext.setActiveTab(newActiveTab);
      selectNewPageFromEditor(newActiveTab, pluginContext);
    } else {
      //pluginContext.setActiveTab(0);
      selectNewPageFromEditor(0, pluginContext);
    }

    //console.log(newActiveTab);
  };

  const handlePageCreation = () => {
    pluginContext.setLoadingState('MINOR');
    let tempDoc = pluginContext.currentDocData;
    let newPage = createNewPageJSON(tempDoc.pages.length + 1);
    tempDoc.pages.push(newPage);
    /*console.log('Page creation');*/
    pushNewDataToFigma(pluginContext, tempDoc);
  };

  //This is here so if the user selects another documetn section, the editor and the tabs will forcefully reload with the new data
  React.useEffect(() => {
    if (pluginContext.currentDocData.sectionId != mountedSectionId) {
      setKey(key == 1 ? 2 : 1);
      setMountedSectionId(pluginContext.currentDocData.sectionId);
    }
  }, [pluginContext.currentDocData]);

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
          label={decodeStringForFigma(
            pluginContext.currentDocData.pages[i].title
          )}
          {...a11yProps(i)}
          key={i}
        />
      );
    }

    setTabs(tempTabs);
  }, [pluginContext.incomingFigmaChanges, pluginContext.incomingEditorChanges]);

  const circularLoader = <CircularProgress size={16} />;

  return (
    <ViewContainer>
      <AppBar elevation={0} color="transparent" sx={{ top: 49 }} key={key}>
        <Stack direction="row">
          <Tabs
            value={
              tabs.length > pluginContext.activeTab
                ? pluginContext.activeTab
                : 0
            }
            variant={'scrollable'}
            scrollButtons={'auto'}
            onChange={handleChange}
            aria-label="Pages on the document"
          >
            {tabs}
          </Tabs>
          <Tooltip title={'Add a new page'}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                sx={{ margin: 'auto 0' }}
                onClick={() => handlePageCreation()}
                disabled={
                  pluginContext.loadingState != 'NONE' ||
                  pluginContext.outdatedComponents
                }
              >
                <Add />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <Divider />
      </AppBar>
      {!pluginContext.outdatedComponents ? (
        <>
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
            <Editor key={key} />
          </Box>
          <Snackbar
            open={pluginContext.incomingFigmaChanges}
            autoHideDuration={1000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            message={'Loading the latest Figma changes'}
            action={circularLoader}
          />{' '}
        </>
      ) : (
        <OutDatedComponentsView />
      )}
    </ViewContainer>
  );
};
