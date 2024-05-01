import * as React from 'react';

import Stack from '@mui/material/Stack';

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
      <Stack
        spacing={1}
        alignItems="center"
        justifyContent={'center'}
        style={{ flex: '1 1 auto' }}
      ></Stack>
    </>
  );
};
