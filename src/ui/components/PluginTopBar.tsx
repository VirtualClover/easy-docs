import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  Input,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { Close, Edit, SettingsOutlined } from '@mui/icons-material';
import { DocData, PluginData } from '../../utils/constants';

import { PluginDataContext } from '../../utils/PluginDataContext';
import React from 'react';
import { navigate } from '../../utils/navigate';

interface BarProps {
  pluginContext: PluginData;
}

const InspectBar = ({ pluginContext }: BarProps) => (
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
const EditorBar = ({ pluginContext }: BarProps) => {
  const [editDocTitle, setEditDocTitle] = React.useState(false);
  const [editIconVisible, setEditIconVisible] = React.useState(false);

  function handleInputChange(pluginContext: PluginData, title: string) {
    let tempDoc: DocData = {
      ...pluginContext.currentDocData,
      title: title,
    };
    pluginContext.setCurrentDocData(tempDoc);
    pluginContext.setIncomingEditorChanges(true);
    parent.postMessage(
      {
        pluginMessage: {
          type: 'update-selected-doc',
          data: tempDoc,
        },
      },
      '*'
    );
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
          <Button variant="outlined" size="small">
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

const SettingsBar = ({ pluginContext }: BarProps) => (
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

function decideBarContent(pluginContext: PluginData) {
  switch (pluginContext.navigation.currentView) {
    case 'INSPECT':
      return <InspectBar pluginContext={pluginContext} />;
      break;
    case 'EDITOR':
      return <EditorBar pluginContext={pluginContext} />;
      break;
    case 'SETTINGS':
      return <SettingsBar pluginContext={pluginContext} />;
      break;
    default:
      return <InspectBar pluginContext={pluginContext} />;
      break;
  }
}

export const PluginTopBar = () => {
  const pluginContext = React.useContext(PluginDataContext);

  const [barContent, setBarContent] = React.useState(
    <InspectBar pluginContext={pluginContext} />
  );

  React.useEffect(() => {
    setBarContent(decideBarContent(pluginContext));
    console.log(pluginContext.currentDocData);
    
  }, [
    pluginContext.navigation.currentView,
    pluginContext.currentDocData.title
  ]);

  return (
    <AppBar elevation={0} color="transparent">
      <Toolbar variant="dense">{barContent}</Toolbar>
      <Divider />
    </AppBar>
  );
};
