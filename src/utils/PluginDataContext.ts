import * as React from 'react';

import { DEFAULT_PLUGIN_DATA } from './constants/constants';

/**
 * The initial plugin data context
 */
export const PluginDataContext = React.createContext(DEFAULT_PLUGIN_DATA);
