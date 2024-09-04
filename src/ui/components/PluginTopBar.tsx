import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  Input,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { ArrowBack, Edit, SettingsOutlined } from '@mui/icons-material';
import {
  DocData,
  PluginData,
  UNTITLED_DOC_PLACEHOLDER,
} from '../../utils/constants';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../utils/general/cleanseTextData';

import { ExportView } from './ExportView';
import { PluginDataContext } from '../../utils/constants/PluginDataContext';
import React from 'react';
import { navigate } from '../../utils/editor/navigate';
import { pushNewDataToFigma } from '../../utils/editor/pushNewDataToFigma';

/**
 * The button that takes you to the settings
 * @returns
 */
const SettingsButton = () => {
  const pluginContext = React.useContext(PluginDataContext);

  const [loading, setLoading] = React.useState(false);

  //Determine loading
  React.useEffect(() => {
    setLoading(
      pluginContext.incomingFigmaChanges ||
        pluginContext.buildingComponentDoc ||
        pluginContext.outdatedComponents ||
        pluginContext.sheetOpen
    );
  }, [
    pluginContext.incomingFigmaChanges,
    pluginContext.outdatedComponents,
    pluginContext.sheetOpen,
  ]);

  return (
    <Tooltip title="Settings">
      <span>
        <IconButton
          onClick={() => navigate('SETTINGS', pluginContext)}
          disabled={loading}
        >
          <SettingsOutlined />
        </IconButton>
      </span>
    </Tooltip>
  );
};

/**
 * The top bar of the inspect view
 * @returns
 */
const InspectBar = () => {
  return (
    <>
      <Typography variant="h4" component="div" sx={{ flexGrow: 1, ml: 16 }}>
        Inspect
      </Typography>
      <SettingsButton />
    </>
  );
};
/**
 * The top bar of the editor view
 * @returns
 */
const EditorBar = () => {
  const [editDocTitle, setEditDocTitle] = React.useState(false);
  const pluginContext = React.useContext(PluginDataContext);

  /**
   * Handles the change of the document title
   * @param pluginContext
   * @param title
   */
  function handleInputChange(pluginContext: PluginData, title: string) {
    let tempDoc: DocData = {
      ...pluginContext.currentDocData,
      title: title ? encodeStringForHTML(title) : UNTITLED_DOC_PLACEHOLDER,
    };
    pushNewDataToFigma(pluginContext, tempDoc);
    setEditDocTitle(false);
  }

  const [loading, setLoading] = React.useState(false);

  //Determine loading
  React.useEffect(() => {
    setLoading(
      pluginContext.incomingFigmaChanges ||
        pluginContext.buildingComponentDoc ||
        pluginContext.outdatedComponents ||
        pluginContext.sheetOpen
    );
  }, [
    pluginContext.incomingFigmaChanges,
    pluginContext.buildingComponentDoc,
    pluginContext.outdatedComponents,
    pluginContext.sheetOpen,
  ]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Typography
        variant="h4"
        component="div"
        noWrap
        sx={{
          opacity: loading ? 0.5 : 1,
          ml: 16,
          '&:hover': {
            cursor: !pluginContext.outdatedComponents ? 'pointer' : 'default',
          },
          maxWidth: '80%',
        }}
        onDoubleClick={() => {
          if (!loading) {
            setEditDocTitle(true);
          }
        }}
      >
        <Tooltip title={!loading ? 'Double click to edit!' : ''}>
          <span>
            {decodeStringForFigma(
              editDocTitle ? '' : pluginContext.currentDocData.title
            )}
          </span>
        </Tooltip>
        <Tooltip title={!loading ? 'Edit document title' : ''}>
          <span>
            <IconButton
              onClick={() => setEditDocTitle(true)}
              sx={{ display: `${!editDocTitle ? 'inline-block' : 'none'}` }}
              disabled={loading}
            >
              <Edit />
            </IconButton>
          </span>
        </Tooltip>
      </Typography>
      {editDocTitle && (
        <Input
          autoFocus
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleInputChange(
                pluginContext,
                (e.target as HTMLTextAreaElement).value
              );
            }
          }}
          onBlur={(e) => handleInputChange(pluginContext, e.target.value)}
          sx={{
            position: 'relative',
            zIndex: 1400,
            bgcolor: 'background.default',
            top: 1,
            left: 0,
            typography: 'h4',
          }}
          fullWidth
          size="small"
          defaultValue={decodeStringForFigma(
            pluginContext.currentDocData.title
          )}
        />
      )}
      {
        <Stack direction={'row'} gap={8}>
          <Button
            variant="outlined"
            disabled={loading}
            size="small"
            onClick={() => {
              pluginContext.setSheetZIndex(0);
              pluginContext.setSheetOpen(true);
              pluginContext.setSheetContent(() => <ExportView />);
              //console.log(markdown);
            }}
          >
            Export
          </Button>
          <SettingsButton />
        </Stack>
      }
    </Box>
  );
};

/**
 * The top bar of the settings view
 * @returns
 */
const SettingsBar = () => {
  const pluginContext = React.useContext(PluginDataContext);
  return (
    <>
      {
        <Tooltip title="Exit settings">
          <span>
            <IconButton
              onClick={() =>
                navigate(pluginContext.navigation.prevView, pluginContext)
              }
            >
              <ArrowBack />
            </IconButton>
          </span>
        </Tooltip>
      }
      <Typography variant="h4" component="div" sx={{ flexGrow: 1, ml: 16 }}>
        Settings
      </Typography>
    </>
  );
};

let decideBarContent = (pluginContext: PluginData) => {
  switch (pluginContext.navigation.currentView) {
    case 'INSPECT':
      return <InspectBar />;
      break;
    case 'EDITOR':
      return <EditorBar />;
      break;
    case 'SETTINGS':
      return <SettingsBar />;
      break;
    default:
      return <InspectBar />;
      break;
  }
};

/**
 * The top bar of the plugin
 * @returns 
 */
export const PluginTopBar = () => {
  const pluginContext = React.useContext(PluginDataContext);

  const [barContent, setBarContent] = React.useState(<InspectBar />);

  React.useEffect(() => {
    setBarContent(decideBarContent(pluginContext));
  }, [
    pluginContext.navigation.currentView,
    pluginContext.currentDocData.title,
  ]);

  return (
    <AppBar elevation={0} color="transparent">
      <Toolbar variant="dense">{barContent}</Toolbar>
      <Divider />
    </AppBar>
  );
};
