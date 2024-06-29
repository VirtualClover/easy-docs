import { Stack, Toolbar } from '@mui/material';

export const ViewContainer = ({ children }) => {
  return (
    <>
      <Stack>
        <Toolbar variant="dense" />
      </Stack>
      <Stack
        spacing={1}
        alignItems="center"
        justifyContent={'center'}
        style={{ flex: '1 1 auto', overflow: 'hidden', position: 'relative' }}
      >
        {children}
      </Stack>
    </>
  );
};
