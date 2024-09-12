import * as React from 'react';
import * as _ from 'lodash';

import { Add, Replay } from '@mui/icons-material';
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

/**
 * Generates the A11Props for the tabs
 * @param index
 * @returns
 */
let generateA11yProps = (index: number) => {
  return {
    id: `menu-tab-${index}`,
    'aria-controls': `menu-tabpanel-${index}`,
  };
};

export const EditorView = () => {
  const [tabs, setTabs] = React.useState([]);
  const [key, setKey] = React.useState(1); // Use to trigger a reload for the editor and tabs component
  const pluginContext = React.useContext(PluginDataContext);
  const [mountedSectionId, setMountedSectionId] = React.useState(
    pluginContext.currentDocData.sectionId
  );
  const [mountedActiveTab, setMountedActiveTab] = React.useState(
    pluginContext.activeTab
  );
  const [creatingNewPage, setCreatingNewPage] = React.useState(false);
  const [loading, setLoading] = React.useState(false);


  /**
   * Handles the change of the active tab
   * @param event
   * @param newActiveTab
   */
  let handleChange = (event: React.SyntheticEvent, newActiveTab: number) => {
    if (newActiveTab < tabs.length) {
      selectNewPageFromEditor(newActiveTab, pluginContext);
    } else {
      // FAILSAFE If the given index is not found on the current document, the reset it to 0
      selectNewPageFromEditor(0, pluginContext);
    }

    //console.log(newActiveTab);
  };

  /**
   * Creates a new page in the document and tells figma to add it
   */
  let handlePageCreation = () => {
    //pluginContext.setLoadingState('MINOR');
    setCreatingNewPage(true);
    let tempDoc = pluginContext.currentDocData;
    let newPage = createNewPageJSON(tempDoc.pages.length + 1);
    tempDoc.pages.push(newPage);
    pushNewDataToFigma(pluginContext, tempDoc);
  };

  let handleFrameReload = () => {
    pushNewDataToFigma(
      pluginContext,
      pluginContext.currentDocData,
      pluginContext.currentDocData.pages[pluginContext.activeTab].frameId,
      true
    );
  };

  //This is here so if the user selects another document section or tab/frame, the editor and the tabs will forcefully remount with the new data
  React.useEffect(() => {
    if (
      pluginContext.currentDocData.sectionId != mountedSectionId ||
      mountedActiveTab != pluginContext.activeTab
    ) {
      setKey(key == 1 ? 2 : 1);
      setCreatingNewPage(false);
      setMountedSectionId(pluginContext.currentDocData.sectionId);
      setMountedActiveTab(pluginContext.activeTab);
    }
  }, [pluginContext.currentDocData, pluginContext.activeTab]);

  //Remounts the tabs with new data
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
          {...generateA11yProps(i)}
          key={i}
        />
      );
    }

    setTabs(tempTabs);
  }, [pluginContext.incomingFigmaChanges, pluginContext.incomingEditorChanges]);

  //Set loading
  React.useEffect(() => {
    setLoading(
      pluginContext.incomingFigmaChanges ||
      creatingNewPage ||
      pluginContext.outdatedComponents ||
      pluginContext.buildingComponentDoc ||
      pluginContext.sheetOpen
    );
  }, [
    pluginContext.incomingFigmaChanges,
    creatingNewPage,
    pluginContext.buildingComponentDoc,
    pluginContext.outdatedComponents,
    pluginContext.sheetOpen,
  ]);

  const circularLoader = <CircularProgress size={16} />;

  return (
    <ViewContainer>
      <AppBar elevation={0} color="transparent" sx={{ top: 49 }} key={key}>
        <Stack direction="row" justifyContent={'space-between'} sx={{ mr: 4 }}>
          {!pluginContext.outdatedComponents && <>
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
                    disabled={loading}
                  >
                    <Add />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
            <Tooltip title={'Reload the current page'}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={() => handleFrameReload()}
                  sx={{ margin: 'auto 0' }}
                  disabled={loading}
                >
                  <Replay />
                </IconButton>
              </span>
            </Tooltip>
          </>
          }
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
          {!pluginContext.sheetOpen && (
            <Snackbar
              open={pluginContext.incomingFigmaChanges}
              autoHideDuration={1000}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              message={'Loading the latest Figma changes'}
              action={circularLoader}
            />
          )}
        </>
      ) : (
        <OutDatedComponentsView />
      )}
    </ViewContainer>
  );
};
