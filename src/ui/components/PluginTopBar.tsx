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
import { Close, SettingsOutlined } from '@mui/icons-material';
import { DocData, PluginData } from '../../utils/constants';

import { ExportView } from './ExportView';
import { PluginDataContext } from '../../utils/PluginDataContext';
import React from 'react';
import { exportMarkdown } from '../../utils/docs/exportMarkDown';
import { navigate } from '../../utils/navigate';
import { pushNewDataToFigma } from '../../utils/editor/pushNewDataToFigma';

interface BarProps {
  pluginContext: PluginData;
}

const InspectBar = () => {
  const pluginContext = React.useContext(PluginDataContext);
  return (
    <>
      <Typography variant="h4" component="div" sx={{ flexGrow: 1, ml: 16 }}>
        Inspect
      </Typography>
      {
        <IconButton onClick={() => navigate('SETTINGS', pluginContext)}>
          <SettingsOutlined />
        </IconButton>
      }
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
      title: title,
    };
    pushNewDataToFigma(pluginContext, tempDoc);
    setEditDocTitle(false);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Tooltip title="Double click to edit!">
        <Typography
          variant="h4"
          component="div"
          noWrap
          sx={{
            ml: 16,
            '&:hover': {
              cursor: 'pointer',
            },
            maxWidth: '80%',
          }}
          onDoubleClick={() => setEditDocTitle(true)}
          onMouseEnter={() => setEditIconVisible(true)}
          onMouseLeave={() => setEditIconVisible(false)}
        >
          {editDocTitle ? '' : pluginContext.currentDocData.title}
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
          defaultValue={pluginContext.currentDocData.title}
        />
      )}
      {
        <Stack direction={'row'} gap={8}>
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
                <ExportView pageData={markdown} />
              ));
              //console.log(markdown);
            }}
          >
            Export
          </Button>
          <IconButton onClick={() => navigate('SETTINGS', pluginContext)}>
            <SettingsOutlined />
          </IconButton>
        </Stack>
      }
    </Box>
  );
};

const SettingsBar = () => {
  const pluginContext = React.useContext(PluginDataContext);
  return (
    <>
      <Typography variant="h4" component="div" sx={{ flexGrow: 1, ml: 16 }}>
        Settings
      </Typography>
      {
        <IconButton
          onClick={() =>
            navigate(pluginContext.navigation.prevView, pluginContext)
          }
        >
          <Close />
        </IconButton>
      }
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
