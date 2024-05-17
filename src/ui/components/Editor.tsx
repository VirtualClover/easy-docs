import * as _ from 'lodash';

import { DocData, EMPTY_AUTHOR_DATA, PageData } from '../../utils/constants';

import { Box } from '@mui/material';
import { EDITOR_TOOLS } from '../../utils/editor/editorConfig';
import { EditorSkeleton } from './skeletons/EditorSkeleton';
import { OutputData } from '@editorjs/editorjs';
import { PluginDataContext } from '../../utils/PluginDataContext';
import React from 'react';
import { clone } from '../../utils/clone';
import { createReactEditorJS } from 'react-editor-js';
import { formatPageData } from '../../utils/docs/formatPageData';
import { pushNewDataToFigma } from '../../utils/editor/pushNewDataToFigma';
import { reconcilePageData } from '../../utils/docs/reconcileData';

const ReactEditorJS = createReactEditorJS();

export const Editor = () => {
  const editorCore = React.useRef(null);
  const [stopUpdates, setStopUpdates] = React.useState(false);
  const [firstRender, setFirstRender] = React.useState(true);
  const [skeleton, setSkeleton] = React.useState(false);

  const pluginContext = React.useContext(PluginDataContext);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!pluginContext.incomingFigmaChanges && !stopUpdates) {
        console.log('interval');
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
              true
            );

            if (reconciliation.changesNumber) {
              let pageData = reconciliation.data as PageData;
              formatPageData(pageData);
              console.log('Pre reconciliation current editor data');
              console.log(data);
              console.log('Pre reconciliation CURRENT CONTEXT DATA');
              console.log(pluginContext.currentDocData);
              let tempDoc: DocData = clone(pluginContext.currentDocData);
              tempDoc.pages[pluginContext.activeTab] = pageData;
              tempDoc.author = EMPTY_AUTHOR_DATA;
              pushNewDataToFigma(pluginContext, tempDoc, pageData.frameId);
            }
          } else {
            //New figma changes
            if (!pluginContext.currentDocData.pages[pluginContext.activeTab]) {
              console.log(
                ' if no blocks length. render when active tab does not exist in doc'
              );
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'select-node',
                    id: pluginContext.currentDocData.pages[0].frameId,
                  },
                },
                '*'
              );
            } else {
              console.log(
                'if no blocks length. render when active tab exists in doc'
              );

              handleUpdateData(
                pluginContext.currentDocData.pages[pluginContext.activeTab]
              ).then(() => {
                setStopUpdates(false);
                pluginContext.setIncomingFigmaChanges(false);
              });
            }
          }
        });
      } else {
        //New figma changes
        if (!pluginContext.currentDocData.pages[pluginContext.activeTab]) {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'select-node',
                id: pluginContext.currentDocData.pages[0].frameId,
              },
            },
            '*'
          );
        } else {
          console.log(
            'if incoming figma changes. render when active tab exists in doc'
          );
          handleUpdateData(
            pluginContext.currentDocData.pages[pluginContext.activeTab]
          ).then(() => {
            setStopUpdates(false);
            pluginContext.setIncomingFigmaChanges(false);
          });
        }
      }
    }, 400);
    return () => {
      //console.log('Cleared!');
      clearInterval(interval);
    };
  }, [
    pluginContext.currentDocData,
    pluginContext.activeTab,
    pluginContext.incomingFigmaChanges,
    stopUpdates,
  ]);

  const handleInitialize = React.useCallback((instance) => {
    console.log('Initialized');
    //console.log(pluginContext.currentDocData);
    editorCore.current = instance;
    pluginContext.setIncomingFigmaChanges(false);
    if (firstRender) {
      setFirstRender(false);
    }
  }, []);

  const handleUpdateData = React.useCallback(async (data: OutputData) => {
    console.log('renders');
    setSkeleton(true);
    await editorCore.current
      .render(data)
      .then(() => {
        setSkeleton(false);
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
    console.log(`axtive tab on editor render: ${pluginContext.activeTab}`);

    if (!firstRender) {
      setStopUpdates(true);
      console.log('change of tabs. render when active tab exists in doc');
      handleUpdateData(
        pluginContext.currentDocData.pages[pluginContext.activeTab]
      ).then(() => {
        setStopUpdates(false);
        console.log('set false');
      });
    }
  }, [pluginContext.activeTab]);

  return (
    <>
      {(firstRender || skeleton || pluginContext.incomingFigmaChanges) && (
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 1300,
            bgcolor: 'background.default',
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
