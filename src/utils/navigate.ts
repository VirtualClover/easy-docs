import { PluginData, PluginViews } from './constants';

export function navigate(view: PluginViews, pluginContext: PluginData) {
  pluginContext.setNavigation({
    prevView: pluginContext.navigation.currentView,
    currentView: view,
  });
}
