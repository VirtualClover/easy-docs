import {
  AppBar,
  Button,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { Close, SettingsOutlined } from '@mui/icons-material';
import { PluginData, PluginViews } from '../../utils/constants';

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
const EditorBar = ({ pluginContext }: BarProps) => (
  <>
    <Typography variant="h4" component="div" sx={{ flexGrow: 1, ml: 16 }}>
      {pluginContext.currentDocData.title}
    </Typography>
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
  </>
);

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
  }, [pluginContext.navigation.currentView]);

  return (
    <AppBar elevation={0} color="inherit">
      <Toolbar variant="dense">{barContent}</Toolbar>
      <Divider />
    </AppBar>
  );
};
