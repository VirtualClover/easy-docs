import * as React from 'react';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Settings = ({ settings }) => {
  const [showAPIKey, setShowAPIKey] = React.useState(false);

  const handleClickShowAPIKey = () => setShowAPIKey((show) => !show);

  const handleMouseDownAPIKey = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <>
      <section>
        <Alert severity="info">
          <AlertTitle>Connect your JSONBin!</AlertTitle>
          To add track your styles and metrics you’ll need to add a JSONBin URL
          and an API Key.
          <br />
          <Link href="#" underline="always">
            Learn how to generate them →
          </Link>
        </Alert>
      </section>
      <section>
        <Stack spacing={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
              API Key
            </InputLabel>
            <OutlinedInput
              value={settings.API_KEY}
              id="outlined-adornment-password"
              type={showAPIKey ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowAPIKey}
                    onMouseDown={handleMouseDownAPIKey}
                    edge="end"
                  >
                    {showAPIKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="API Key"
            />
          </FormControl>
          <TextField
            id="styles-url"
            label="URL to your Styles Bin"
            variant="outlined"
            value={settings.STYLES_URL}
          />
          <TextField
            id="metrics-url"
            label="URL to your Metrics Bin"
            variant="outlined"
            value={settings.METRICS_URL}
          />
        </Stack>
      </section>
      <Button variant="outlined" color="error" disabled>
        Reset
      </Button>
      <Button variant="contained" disabled>
        Save
      </Button>
    </>
  );
};

export default Settings;
