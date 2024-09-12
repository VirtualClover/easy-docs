import * as React from 'react';
import * as _ from 'lodash';

import { Alert, CircularProgress, Snackbar } from '@mui/material';
import { DocData, PluginData, PluginViews } from '../utils/constants';

import { BottomSheet } from './components/BottomSheet';
import { EditorView } from './EditorView';
import { InspectView } from './InspectView';
import { PluginContainer } from './components/PluginContainer';
import { PluginDataContext } from '../utils/constants/PluginDataContext';
import { PluginTopBar } from './components/PluginTopBar';
import { SettingsView } from './SettingsView';
import { VersionBanner } from './components/VersionBanner';

interface ComponentProps {
  initialPluginData: PluginData;
}

function decideView(currentView: PluginViews) {
  switch (currentView) {
    case 'INSPECT':
      return <InspectView />;
      break;
    case 'EDITOR':
      return <EditorView />;
      break;
    case 'SETTINGS':
      return <SettingsView />;
      break;
    default:
      return <InspectView />;
      break;
  }
}

function App({ initialPluginData }: ComponentProps) {
  const [view, setView] = React.useState(<InspectView />);
  //Context states
  const [currentDocData, setCurrentDocData] = React.useState(
    initialPluginData.currentDocData
  );
  const [navigation, setNavigation] = React.useState(
    initialPluginData.navigation
  );
  const [loadingState, setLoadingState] = React.useState(
    initialPluginData.loadingState
  ); // Todo remove loading states
  const [settings, setSettings] = React.useState(initialPluginData.settings);
  const [incomingFigmaChanges, setIncomingFigmaChanges] = React.useState(
    initialPluginData.incomingFigmaChanges
  );
  const [incomingEditorChanges, setIncomingEditorChanges] = React.useState(
    initialPluginData.incomingEditorChanges
  );

  const [currentUser, setCurrentUser] = React.useState(
    initialPluginData.currentUser
  );

  const [sheetOpen, setSheetOpen] = React.useState(initialPluginData.sheetOpen);
  const [sheetZIndex, setSheetZIndex] = React.useState(0);

  const [outdatedComponents, setOutdatedComponents] = React.useState(false);

  const [sheetContent, setSheetContent] = React.useState(
    initialPluginData.sheetContent
  );

  const [activeTab, setActiveTab] = React.useState(initialPluginData.activeTab);

  const [lastFormatUsed, setLastFormatUsed] = React.useState(
    initialPluginData.lastFormatUsed
  );

  const [lastExportActionUsed, setLastExportActionUsed] = React.useState(
    initialPluginData.lastExportActionUsed
  );

  const [buildingComponentDoc, setBuildingComponentDoc] = React.useState(
    initialPluginData.buildingComponentDoc
  );

  const [showError, setShowError] = React.useState(
    initialPluginData.showError
  );

  const [errorMessage, setErrorMessage] = React.useState(
    initialPluginData.errorMessage
  );

  const circularLoader = <CircularProgress size={16} />;

  React.useEffect(() => {
    setView(decideView(navigation.currentView));
  }, [navigation.currentView]);

  // If the user has selected a section, set the active tab to the first page of the document
  React.useEffect(() => {
    if (!currentDocData.pages[activeTab]) {
      setActiveTab(0);
      //console.log('Reseted active tab on app.tsx');
    }
  }, [activeTab]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (navigation.currentView != 'SETTINGS' && !sheetOpen && !outdatedComponents) {
        parent.postMessage({ pluginMessage: { type: 'node-update' } }, '*');
        onmessage = (event) => {
          if (event.data.pluginMessage) {
            switch (event.data.pluginMessage.type) {
              case 'new-node-data':
                setOutdatedComponents(false);
                let data: DocData = event.data.pluginMessage.data;

                if (
                  data &&
                  data.pages &&
                  (!incomingEditorChanges ||
                    event.data.pluginMessage.overrideEditorChanges)
                ) {
                  setIncomingFigmaChanges(true);
                  console.log('setting this data');

                  setCurrentDocData(data);
                  let selectedFrame = event.data.pluginMessage.selectedFrame;
                  setActiveTab(selectedFrame);
                  /*console.log(
                    `selectedFrame in new node data: ${selectedFrame}`
                  );*/
                  if (navigation.currentView == 'INSPECT') {
                    setNavigation({
                      currentView: 'EDITOR',
                      prevView: navigation.currentView,
                    });
                  }
                }
                break;

              case 'same-node-data':
                let selectedFrame = event.data.pluginMessage.selectedFrame;
                /*console.log(
                  `selectedFrame in same node data: ${selectedFrame}`
                );*/
                //console.log(`activetab PRE-CHANGE: ${activeTab}`);
                if (selectedFrame != activeTab) {
                  //console.log(`set active tab to: ${selectedFrame}`);
                  setActiveTab(selectedFrame);
                  //console.log(`activetab: ${activeTab}`);
                }
                //console.log('------');
                if (navigation.currentView == 'INSPECT') {
                  setNavigation({
                    currentView: 'EDITOR',
                    prevView: navigation.currentView,
                  });
                }
                break;

              case 'no-node':
                if (navigation.currentView == 'EDITOR') {
                  setNavigation({
                    currentView: 'INSPECT',
                    prevView: navigation.currentView,
                  });
                  setOutdatedComponents(false);
                  setSheetOpen(false);
                }
                break;

              case 'finished-figma-update':
                //console.log('set editor changes false');
                setIncomingEditorChanges(false);
                break;

              case 'outdated-components':
                if (!outdatedComponents) {
                  setOutdatedComponents(true);
                }
                //console.log('Theres some components that are outdated reload?');
                break;

              case 'close-outdated-overlay':
                setOutdatedComponents(false);
                break;

              case 'generating-component-doc':
                console.log('Mayor loading');

                setBuildingComponentDoc(true);
                break;

              case 'finished-generating-component-doc':
                setBuildingComponentDoc(false);
                console.log('None loading');
                break;

              default:
                break;
            }
          }
        };
      }
    }, 60);

    return () => clearInterval(interval);
  }, [
    currentDocData,
    navigation,
    activeTab,
    incomingEditorChanges,
    loadingState,
  ]);

  return (
    <PluginDataContext.Provider
      value={{
        currentDocData,
        setCurrentDocData,
        currentUser,
        setCurrentUser,
        navigation,
        setNavigation,
        loadingState,
        setLoadingState,
        settings,
        setSettings,
        incomingFigmaChanges,
        setIncomingFigmaChanges,
        incomingEditorChanges,
        setIncomingEditorChanges,
        activeTab,
        setActiveTab,
        sheetOpen,
        setSheetOpen,
        sheetContent,
        setSheetContent,
        sheetZIndex,
        setSheetZIndex,
        outdatedComponents,
        setOutdatedComponents,
        lastFormatUsed,
        setLastFormatUsed,
        lastExportActionUsed,
        setLastExportActionUsed,
        buildingComponentDoc,
        setBuildingComponentDoc,
        showError,
        setShowError,
        errorMessage,
        setErrorMessage
      }}
    >
      <PluginContainer
        disableGutters
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <PluginTopBar />
        {view}
        <VersionBanner />
        <BottomSheet zIndex={sheetZIndex} />
        <Snackbar
          open={buildingComponentDoc}
          autoHideDuration={1000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={'Generating a component documentation...'}
          action={circularLoader}
        />
        <Snackbar autoHideDuration={30000} open={showError} onClose={() => setShowError(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert
            onClose={() => setShowError(false)}
            severity="error"
            variant='standard'
            sx={{ width: '100%' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </PluginContainer>
    </PluginDataContext.Provider>
  );
}

export default App;
