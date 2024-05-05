import { Drawer } from '@mui/material';
import { PluginDataContext } from '../../utils/PluginDataContext';
import React from 'react';

export const BottomSheet = () => {
  const pluginContext = React.useContext(PluginDataContext);

  React.useEffect(() => {
    if (pluginContext.sheetOpen) {
      //pluginContext.setLoadingState('MAYOR');
    }
    console.log('Sheet open');
  }, [pluginContext.sheetOpen]);

  return (
    <Drawer
      anchor={'bottom'}
      open={pluginContext.sheetOpen}
      onClose={() => pluginContext.setSheetOpen(false)}
    >
      {pluginContext.sheetContent}
    </Drawer>
  );
};
