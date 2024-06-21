import { PluginData, PluginViews } from './constants/constants';

/**
 * Navigation state for the UI of the plugin
 * @param view
 * @param pluginContext
 */
export function navigate(view: PluginViews, pluginContext: PluginData) {
  pluginContext.setNavigation({
    prevView: pluginContext.navigation.currentView,
    currentView: view,
  });
}
