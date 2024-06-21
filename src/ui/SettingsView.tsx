import * as React from 'react';

import {
  AppBar,
  Box,
  Divider,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Toolbar,
} from '@mui/material';

import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { SETTINGS_GROUPS } from '../utils/constants/constants';
import { ViewContainer } from './components/ViewContainer';
import { generateA11yProps } from '../utils/editor/generateA11yProps';

export const SettingsView = ({}) => {
  const [showAPIKey, setShowAPIKey] = React.useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = React.useState(0);
  const [tabs, setTabs] = React.useState([]);
  let [view, setView] = React.useState(<></>);

  const handleClickShowAPIKey = () => setShowAPIKey((show) => !show);

  const handleMouseDownAPIKey = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  React.useEffect(() => {
    let tempTabs: ReactJSXElement[] = [];
    for (let i = 0; i < SETTINGS_GROUPS.length; i++) {
      let tabLabel = SETTINGS_GROUPS[i];
      tempTabs.push(
        <Tab
          sx={{
            maxWidth: 200,
            overflow: 'hidden',
            whiteSpace: 'noWrap',
            textOverflow: 'ellipsis',
            display: 'block',
            flexDirection: 'row',
          }}
          label={tabLabel}
          {...generateA11yProps(i)}
          key={i}
        />
      );
    }
    setTabs(tempTabs);
  }, []);

  let handleChange = (event: React.SyntheticEvent, newActiveTab: number) => {
    setSettingsActiveTab(newActiveTab);
  };

  return (
    <ViewContainer>
      <AppBar elevation={0} color="transparent" sx={{ top: 49 }}>
        <Stack direction="row">
          <Tabs
            value={settingsActiveTab}
            variant={'scrollable'} // If we remove this ternary the Tabs component bugs out
            scrollButtons={'auto'}
            onChange={handleChange}
            aria-label="Setting categories"
          >
            {tabs}
          </Tabs>
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
      ></Box>
      <Snackbar
        open={false}
        autoHideDuration={1000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={'Changes saved!'}
      />
    </ViewContainer>
  );
};
