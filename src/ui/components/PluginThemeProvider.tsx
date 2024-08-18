import * as React from 'react';

import { darkTheme, lightTheme } from '../../styles/themes';

import { ThemeProvider } from '@mui/material/styles';

/**
 * The theme provider of the plugin
 * @param param0
 * @returns
 */
export let PluginThemeProvider = ({ children }) => {
  let [currentClassName, setCurrentClassName] = React.useState(
    document.documentElement.className
  );
  let [mountedTheme, setMountedTheme] = React.useState(
    currentClassName == 'figma-dark' ? darkTheme : lightTheme
  );

  let updateMode = () => {
    if (currentClassName != document.documentElement.className) {
      setCurrentClassName(document.documentElement.className);
    }
  };

  setInterval(updateMode, 1000);

  React.useEffect(() => {
    setMountedTheme(currentClassName == 'figma-dark' ? darkTheme : lightTheme);
  }, [currentClassName]);

  return <ThemeProvider theme={mountedTheme}>{children}</ThemeProvider>;
};
