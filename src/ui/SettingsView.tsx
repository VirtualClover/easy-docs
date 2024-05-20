import * as React from 'react';

import { AppBar, Box, Divider, Snackbar, Stack, Tabs, Toolbar } from '@mui/material';

import { ViewContainer } from './components/ViewContainer';

export const SettingsView = ({}) => {
  const [showAPIKey, setShowAPIKey] = React.useState(false);

  const handleClickShowAPIKey = () => setShowAPIKey((show) => !show);

  const handleMouseDownAPIKey = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <>
    </>
  );
};
