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

export const Editor = () => {
  const editorCore = React.useRef(null);
  const [stopUpdates, setStopUpdates] = React.useState(false);
  const [firstRender, setFirstRender] = React.useState(true);
  const [skeleton, setSkeleton] = React.useState(true);

  const pluginContext = React.useContext(PluginDataContext);
  //Freeze the section when the editor is mounted so if the section changes we delete the data, stop any chnages to send and remount
  //const [sectionId,mountedSectionId] =

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!stopUpdates) {
        setStopUpdates(true);
        //console.log('interval');
        handleSaveEditor().then((data) => {
          /*console.log(
            'plugin context for reconciliation with new saved editor data:'
          );
          console.log(pluginContext.currentDocData);*/

          if (data.blocks.length) {
            let reconciliation = reconcilePageData(
              {
                ...data,
                frameId:
                  pluginContext.currentDocData.pages[pluginContext.activeTab]
                    .frameId,
              },
              pluginContext.currentDocData.pages[pluginContext.activeTab],
              true,
              {new:'editor', current: pluginContext.currentDocData.author.changesMadeIn}
            );

            if (reconciliation.changesNumber) {
              if (pluginContext.incomingFigmaChanges) {
                handleUpdateData(
                  pluginContext.currentDocData.pages[pluginContext.activeTab]
                );
              } else {
                let pageData = reconciliation.data as PageData;
                formatPageData(pageData);
                /*console.log('Pre reconciliation current editor data');
                console.log(data);
                console.log('Pre reconciliation CURRENT CONTEXT DATA');
                console.log(pluginContext.currentDocData);
                console.log('Recon data');
                console.log(reconciliation);*/
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
              /*console.log(
                ' if no blocks length. render when active tab does not exist in doc'
              );*/
              selectNewPageFromEditor(0, pluginContext);
            } else {
              /*console.log(
                'if no blocks length. render when active tab exists in doc'
              );*/

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

  const handleInitialize = React.useCallback((instance) => {
    //console.log('Initialized');
    //console.log(pluginContext.currentDocData);
    setSkeleton(true);
    editorCore.current = instance;
    if (firstRender) {
      setFirstRender(false);
    }
  }, []);

  const handleUpdateData = React.useCallback(async (data: OutputData) => {
    //console.log('renders');
    await editorCore.current
      .render(data)
      .then(() => {
        //console.log('set false on render');
        setSkeleton(false);
        pluginContext.setIncomingFigmaChanges(false);
        //console.log('set figma changes on false');
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  const handleSaveEditor = async () => {
    let newData: PageData = await editorCore.current.save(); //Page data
    return newData;
  };

  //Change tabs
  React.useEffect(() => {
    if (!firstRender) {
      setSkeleton(true);
      setStopUpdates(true);
      //console.log(`axtive tab on editor render: ${pluginContext.activeTab}`);
      //console.log('change of tabs. render when active tab exists in doc');
      handleUpdateData(
        pluginContext.currentDocData.pages[pluginContext.activeTab]
      ).then(() => {
        setStopUpdates(false);
        pluginContext.setLoadingState('NONE');
        //console.log('set false');
      });
    }
  }, [pluginContext.activeTab]);

  return (
    <>
      {(pluginContext.incomingFigmaChanges || pluginContext.buildingComponentDoc ||
        skeleton ||
        pluginContext.loadingState != 'NONE') && (
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 1300,
            bgcolor: 'background.default',
            left: 0,
            top:50,
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
