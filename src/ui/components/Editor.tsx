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
  const [loading, setLoading] = React.useState(true);

  /**
   * Handles the mount the editor
   */
  const handleInitialize = React.useCallback((instance) => {
    console.log('Initialized');
    console.log(componentIsMounted);
    //console.log(pluginContext.currentDocData);
    //setSkeleton(true);
    editorCore.current = instance;
    if (componentIsMounted) {
      setComponentIsMounted(false);
    }
  }, []);

  /**
   * Handles a new batch of data delivered to the editor
   */
  const handleUpdateData = React.useCallback(async (data: OutputData) => {
    //console.log('renders');
    setIsRenderingData(true);
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
    let newData: PageData = await editorCore.current.save(); //Page data
    return newData;
  };

  //Save editor data and decide if it should push it to figma or, if there's new figma changes, then the editor renders the new data
  //We do intervals so the editor is not constantly saving and reconciliating data
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!stopUpdates) {
        setStopUpdates(true);
        //console.log('interval');
        //Get the current data from the editor
        handleSaveEditor().then((data) => {
          /*console.log(
            'plugin context for reconciliation with new saved editor data:'
          );
          console.log(pluginContext.currentDocData);*/

          //Checks if the data is not empty
          if (data.blocks.length) {
            //If it's not empty, does a reconciliation with the current stored data on the plugin
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
              if (pluginContext.incomingFigmaChanges) {
                handleUpdateData(
                  pluginContext.currentDocData.pages[pluginContext.activeTab]
                );
              } else {

                //If there's no figma incoming changes, that means the editor made those changes so let's send those changes to figma!
                let pageData = reconciliation.data as PageData;
                formatPageData(pageData);
                let tempDoc: DocData = clone(pluginContext.currentDocData);
                tempDoc.pages[pluginContext.activeTab] = pageData;
                tempDoc.author = EMPTY_AUTHOR_DATA;
                pushNewDataToFigma(pluginContext, tempDoc, pageData.frameId);
              }
            } else {
              pluginContext.setIncomingFigmaChanges(false);
            }
          } else {
            //New figma changes
            if (!pluginContext.currentDocData.pages[pluginContext.activeTab]) {
              //FAILSAFE If there's not data loaded, and the current active tab index is does not exists in the current document, return to the 0 index, meaning the first tab
              selectNewPageFromEditor(0, pluginContext);
            } else {
              // FAILSAFE If there's not data loaded, and the current active tab index exists in the current document, load said tab
              handleUpdateData(
                pluginContext.currentDocData.pages[pluginContext.activeTab]
              );
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
    pluginContext.activeTab,
    pluginContext.incomingFigmaChanges,
    stopUpdates,
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
    ];

  return (
    <>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 1300,
            bgcolor: 'background.default',
            left: 0,
            top: 50,
            pt: 32,
            pl: 16,
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
        })}
      >
        <ReactEditorJS tools={EDITOR_TOOLS} onInitialize={handleInitialize} />
      </Box>
    </>
  );
};
