import { Drawer } from '@mui/material';
import { PluginDataContext } from '../../utils/PluginDataContext';
import React from 'react';

export const BottomSheet = ({ zIndex = 0 }) => {
  const pluginContext = React.useContext(PluginDataContext);

  React.useEffect(() => {
    if (pluginContext.sheetOpen) {
      //pluginContext.setLoadingState('MAYOR');
    }
  }, [pluginContext.sheetOpen]);

  return (
    <Drawer
      anchor={'bottom'}
      open={pluginContext.sheetOpen}
      onClose={() => pluginContext.setSheetOpen(false)}
      sx={zIndex ? { zIndex: zIndex } : {}}
      PaperProps={{
        sx: {
          backgroundImage: 'none',
          p: 16,
          width: `calc(95vw - 12px)`,
          margin: '0 auto',
          bottom: 6,
          borderRadius: 2,
        },
      }}
    >
      {pluginContext.sheetContent}
    </Drawer>
  );
};
