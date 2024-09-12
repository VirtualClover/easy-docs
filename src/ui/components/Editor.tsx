import * as _ from 'lodash';

import { DocData, EMPTY_AUTHOR_DATA, PageData } from '../../utils/constants';

import { Box } from '@mui/material';
import { EDITOR_TOOLS } from '../../utils/editor/editorConfig';
import { EditorSkeleton } from './skeletons/EditorSkeleton';
import { OutputData } from '@editorjs/editorjs';
import { PluginDataContext } from '../../utils/constants/PluginDataContext';
import React from 'react';
import { clone } from '../../utils/general/clone';
import { createReactEditorJS } from 'react-editor-js';
import { formatPageData } from '../../utils/docs/formatPageData';
import { pushNewDataToFigma } from '../../utils/editor/pushNewDataToFigma';
import { reconcilePageData } from '../../utils/docs/reconcileData';
import { selectNewPageFromEditor } from '../../utils/editor/selectNewPageFromEditor';

const ReactEditorJS = createReactEditorJS();

/**
 * The text editor component, to know more about EditorJS go to:
 * https://editorjs.io/
 * @returns
 */
export const Editor = () => {
  const editorCore = React.useRef(null);
  const pluginContext = React.useContext(PluginDataContext);
  const [stopUpdates, setStopUpdates] = React.useState(false);
  const [isRenderingData, setIsRenderingData] = React.useState(true);
  const [componentIsMounted, setComponentIsMounted] = React.useState(true);
  const [cachedData, setCachedData] = React.useState(pluginContext.currentDocData.pages[pluginContext.activeTab]);
  const [loading, setLoading] = React.useState(true);

  /**
   * Handles the mount the editor
   */
  const handleInitialize = React.useCallback((instance) => {
    editorCore.current = instance;
    if (componentIsMounted) {
      setComponentIsMounted(false);
    }
  }, []);

  /**
   * Handles a new batch of data delivered to the editor
   */
  const handleUpdateData = React.useCallback(async (data: PageData) => {
    console.log('renders');
    setIsRenderingData(true);
    setCachedData(data);
    await editorCore.current
      .render(data)
      .then(() => {
        setIsRenderingData(false);
        pluginContext.setIncomingFigmaChanges(false);
        //console.log('set figma changes on false');
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  /**
   * Saves the data from the editor and returns said data
   * @returns
   */
  const handleSaveEditor = async () => {
    //We check if the low level instance's save function is there since it sometimes its not there for some reason
    if (editorCore.current.dangerouslyLowLevelInstance && typeof editorCore.current.dangerouslyLowLevelInstance?.save === 'function') {

      let newData: PageData = await editorCore.current.save(); //Page data
      return newData;
    }
    return null;
  };

  //Save editor data and decide if it should push it to figma or, if there's new figma changes, then the editor renders the new data
  //We do intervals so the editor is not constantly saving and reconciliating data
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!stopUpdates && !pluginContext.sheetOpen && !componentIsMounted) {
        setStopUpdates(true);
        //Get the current data from the editor
        handleSaveEditor().then((data) => {
          /*console.log(
          'plugin context for reconciliation with new saved editor data:'
        */

          if (data) {
            //Checks if the data blocks is not empty
            if (data.blocks.length) {

              //Check with the last generated data from the editor
              let localReconciliation = reconcilePageData({
                ...data,
                frameId:
                  pluginContext.currentDocData.pages[
                    pluginContext.activeTab
                  ].frameId,
              }, cachedData, true,
                {
                  new: 'editor',
                  current: pluginContext.currentDocData.author.changesMadeIn,
                });

              // if they are not the same send the changes to figma
              if (localReconciliation.changesNumber) {

                {
                  //If there's no figma incoming changes, that means the editor made those changes so let's send those changes to figma!
                  let pageData = localReconciliation.data as PageData;
                  setCachedData(pageData);
                  formatPageData(pageData);
                  let tempDoc: DocData = clone(pluginContext.currentDocData);
                  tempDoc.pages[pluginContext.activeTab] = pageData;
                  tempDoc.author = EMPTY_AUTHOR_DATA;
                  pushNewDataToFigma(
                    pluginContext,
                    tempDoc,
                    pageData.frameId
                  );
                }

              } else {
                // If they are the same, check if they are changes from figma, so we need to do a second reconciliation with the figma changes
                let reconciliation = reconcilePageData(
                  {
                    ...data,
                    frameId:
                      pluginContext.currentDocData.pages[pluginContext.activeTab]
                        .frameId,
                  },
                  pluginContext.currentDocData.pages[pluginContext.activeTab],
                  true,
                  {
                    new: 'editor',
                    current: pluginContext.currentDocData.author.changesMadeIn,
                  }
                );

                //If there are changes between the current stored data from the plugin and the editor, most likely means there's new changes, either in the editor or from figma
                if (reconciliation.changesNumber) {
                  //If the plugin tells there's incoming figma changes, the mount that data into the editor
                  handleUpdateData(
                    pluginContext.currentDocData.pages[pluginContext.activeTab]
                  );
                }
              };
            } else {
              //New figma changes
              if (
                !pluginContext.currentDocData.pages[pluginContext.activeTab]
              ) {
                //FAILSAFE If there's not data loaded, and the current active tab index is does not exists in the current document, return to the 0 index, meaning the first tab
                selectNewPageFromEditor(0, pluginContext);
              } else {
                // FAILSAFE If there's not data loaded, and the current active tab index exists in the current document, load said tab
                handleUpdateData(
                  pluginContext.currentDocData.pages[pluginContext.activeTab]
                );
              }
            }
          }
        });
      }
    }, 600);
    return () => {
      setStopUpdates(false);
      clearInterval(interval);
    };
  }, [
    pluginContext.currentDocData,
    componentIsMounted,
    pluginContext.activeTab,
    pluginContext.incomingFigmaChanges,
    pluginContext.sheetOpen,
    stopUpdates,
    isRenderingData
  ]);


  //Determine Loading
  React.useEffect(() => {
    setLoading(
      componentIsMounted ||
      pluginContext.incomingFigmaChanges ||
      pluginContext.buildingComponentDoc ||
      isRenderingData
    );
  }),
    [
      componentIsMounted,
      pluginContext.incomingFigmaChanges,
      pluginContext.buildingComponentDoc,
      isRenderingData,
      pluginContext.sheetOpen,
    ];

  return (
    <>
      {loading && !pluginContext.sheetOpen && (
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            bgcolor: 'background.default',
            left: 0,
            top: 50,
            pt: 32,
            pl: 16,
            opacity: .5
          }}
        >
          <EditorSkeleton />
        </Box>
      )}
      <Box
        id="editorjs"
        sx={(theme) => ({
          ...theme.typography,
          fontSize: 14,
          position: 'relative',
          height: '100%',
          width: '100%',
          transition: '.3s',
          opacity: pluginContext.incomingFigmaChanges ? 0 : 1,
          pointerEvents: pluginContext.incomingFigmaChanges ? 'none' : 'auto' //Using pointer events for disabling the editor since using the readonly property on editor js is not possible with the ReactEditorJS component, I think...
        })}
      >
        <ReactEditorJS tools={EDITOR_TOOLS} onInitialize={handleInitialize}/>
      </Box>
    </>
  );
};
