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
import { ArrowBack, SettingsOutlined } from '@mui/icons-material';
import { DocData, PluginData, UNTITLED_DOC_PLACEHOLDER } from '../../utils/constants';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../utils/general/cleanseTextData';

import { ExportView } from './ExportView';
import { PluginDataContext } from '../../utils/constants/PluginDataContext';
import React from 'react';
import { navigate } from '../../utils/editor/navigate';
import { pushNewDataToFigma } from '../../utils/editor/pushNewDataToFigma';

interface BarProps {
  pluginContext: PluginData;
}

const SettingsButton = () => {
  const pluginContext = React.useContext(PluginDataContext);
  return (
    <Tooltip title="Settings">
      <span>
        <IconButton
          onClick={() => navigate('SETTINGS', pluginContext)}
          disabled={pluginContext.loadingState != 'NONE'}
        >
          <SettingsOutlined />
        </IconButton>
      </span>
    </Tooltip>
  );
};

const InspectBar = () => {
  const pluginContext = React.useContext(PluginDataContext);
  return (
    <>
      <Typography variant="h4" component="div" sx={{ flexGrow: 1, ml: 16 }}>
        Inspect
      </Typography>
      <SettingsButton />
    </>
  );
};
const EditorBar = () => {
  const [editDocTitle, setEditDocTitle] = React.useState(false);
  const [editIconVisible, setEditIconVisible] = React.useState(false);
  const pluginContext = React.useContext(PluginDataContext);

  function handleInputChange(pluginContext: PluginData, title: string) {
    let tempDoc: DocData = {
      ...pluginContext.currentDocData,
      title: title ? encodeStringForHTML(title) : UNTITLED_DOC_PLACEHOLDER,
    };
    pushNewDataToFigma(pluginContext, tempDoc);
    setEditDocTitle(false);
  }

  const [disableActions, setDisableActions] = React.useState(false);

  React.useEffect(() => {
    if (
      pluginContext.incomingFigmaChanges ||
      pluginContext.loadingState != 'NONE'
    ) {
      setDisableActions(true);
    } else {
      setDisableActions(false);
    }
  }, [pluginContext.incomingFigmaChanges, pluginContext.loadingState]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Tooltip
        title={!pluginContext.outdatedComponents ? 'Double click to edit!' : ''}
      >
        <Typography
          variant="h4"
          component="div"
          noWrap
          sx={{
            opacity: disableActions ? 0.5 : 1,
            ml: 16,
            '&:hover': {
              cursor: !pluginContext.outdatedComponents ? 'pointer' : 'default',
            },
            maxWidth: '80%',
          }}
          onDoubleClick={() => {
            if (!disableActions) {
              setEditDocTitle(true);
            }
          }}
          onMouseEnter={() => setEditIconVisible(true)}
          onMouseLeave={() => setEditIconVisible(false)}
        >
          {decodeStringForFigma(
            editDocTitle ? '' : pluginContext.currentDocData.title
          )}
          {/* <IconButton
          onClick={() => setEditDocTitle(true)}
          sx={{ visibility: `${editIconVisible ? 'visible' : 'hidden'}` }}
        >
          <Edit />
      </IconButton>*/}
        </Typography>
      </Tooltip>
      {editDocTitle && (
        <Input
          autoFocus
          disabled={disableActions}
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
            disabled={disableActions}
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

function decideBarContent(pluginContext: PluginData) {
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
}

export const PluginTopBar = () => {
  const pluginContext = React.useContext(PluginDataContext);

  const [barContent, setBarContent] = React.useState(<InspectBar />);

  React.useEffect(() => {
    setBarContent(decideBarContent(pluginContext));
    //console.log(pluginContext.currentDocData);
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

/*

          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              //console.log(pluginContext);
              let markdown = exportMarkdown(
                pluginContext.currentDocData.pages[pluginContext.activeTab]
              );
              pluginContext.setSheetOpen(true);
              pluginContext.setSheetContent(() => (
                <ExportView markdown={markdown} />
              ));
              //console.log(markdown);
            }}
          >
            Export
          </Button>




*/
