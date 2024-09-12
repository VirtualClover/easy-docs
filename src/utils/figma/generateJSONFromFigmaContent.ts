import {
  BaseComponentData,
  DocData,
  EMPTY_DOC_OBJECT,
  FIGMA_COMPONENT_DATA_KEY,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_LAST_EDITED_KEY,
  FIGMA_NAMESPACE,
  PageData,
  PluginSettings,
  UNTITLED_DOC_PLACEHOLDER,
} from '../constants';
import {
  generateBlockDataFromComponentDoc,
  hydrateComponentDoc,
} from './components/componentDocComponent.figma';
import {
  generateBlockDataFromDisplayFrame,
  hydrateDisplayFrame,
} from './components/displayFrameComponent.figma';
import {
  generateBlockDataFromDosAndDonts,
  hydrateDosAndDontsFrame,
} from './components/dosAndDontsComponent.figma';

import { encodeStringForHTML } from '../general/cleanseTextData';
import { formatPageData } from '../docs/formatPageData';
import { generateBlockDataFromAlert } from './components/AlertComponent.figma';
import { generateBlockDataFromCode } from './components/codeComponent.figma';
import { generateBlockDataFromDivider } from './components/dividerComponent.figma';
import { generateBlockDataFromHeader } from './components/headerComponent.figma';
import { generateBlockDataFromList } from './components/listComponent.figma';
import { generateBlockDataFromParagraph } from './components/paragraphComponent.figma';
import { generateBlockDataFromQuote } from './components/quoteComponent.figma';
import { generateBlockDataFromTable } from './components/tableComponent.figma';
import { getMainCompIdFromInstance } from './getMainCompIdFromInstance';
import { getPluginSettings } from './getPluginSettings';
import { getUserDetailsInFigma } from './getUserDetailsFigma';
import { handleFigmaError } from './handleFigmaError';
import { scanForInstancesInsideAFrame } from './scans';
import { styleFrame } from './styleFrame';

/**
 * Generates a Document from a Figma Section
 * @param section
 * @returns
 */
export let generateJSONFromFigmaContent = async (
  section: SectionNode
): Promise<{
  docData: DocData;
  overrideEditorChanges: boolean;
}> => {
  if (!section.name) {
    section.name = UNTITLED_DOC_PLACEHOLDER;
  }
  let response: { docData: DocData; overrideEditorChanges: boolean } = {
    docData: {
      title: encodeStringForHTML(section.name),
      pages: [],
      sectionId: section.id,
      author: {
        changesMadeIn: 'figma',
        user: getUserDetailsInFigma(),
      },
      lastEdited: Date.now().toString(),
    },
    overrideEditorChanges: false,
  };

  let settings = getPluginSettings();

  let stringComponentData = figma.root.getSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_COMPONENT_DATA_KEY
  );
  let componentData: BaseComponentData = JSON.parse(stringComponentData);

  if (section.children) {
    let children = section.children;

    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      if (child.type == 'FRAME') {
        await generatePageDataFromFrame(child, componentData, settings)
          .then((res) => {
            response.docData.pages.push(res.pageData);
            if (res.hasComponentDocBlock) {
              response.overrideEditorChanges = true;
            }
          })
          .catch((e) => handleFigmaError('F22', e));
      }
    }

    return response;
  }

  return {
    docData: EMPTY_DOC_OBJECT,
    overrideEditorChanges: false,
  };
};

/**
 * Generates Page Data from a Figma Frame
 * @param frame
 * @param componentData
 * @param settings
 * @returns
 */
export let generatePageDataFromFrame = async (
  frame: FrameNode,
  componentData: BaseComponentData,
  settings: PluginSettings
): Promise<{ pageData: PageData; hasComponentDocBlock: boolean }> => {
  let response: { pageData: PageData; hasComponentDocBlock: boolean } = {
    pageData: { blocks: [], title: '', frameId: frame.id },
    hasComponentDocBlock: false,
  };
  if (frame.layoutMode != 'VERTICAL') {
    styleFrame(frame, settings);
  }
  if (frame.children.length) {
    let children = frame.children;
    for (let i = 0; i < children.length; i++) {
      let childNode = children[i];

      if (childNode) {
        let editedDate =
          parseInt(
            childNode.getSharedPluginData(
              FIGMA_NAMESPACE,
              FIGMA_LAST_EDITED_KEY
            ),
            10
          ) || Date.now();
        let objEssentials = {
          lastEdited: editedDate,
          figmaNodeId: childNode.id,
        };

        let version: number;

        if (childNode.type == 'INSTANCE') {
          version = parseInt(
            childNode.getSharedPluginData(
              FIGMA_NAMESPACE,
              FIGMA_COMPONENT_VERSION_KEY
            )
          );

          if (version == componentData.lastGenerated) {
            let mainCompId: string;
            await getMainCompIdFromInstance(childNode)
              .then((id) => (mainCompId = id))
              .catch((e) => handleFigmaError('F23', e));

            switch (mainCompId) {
              case componentData.components.header.id:
                await generateBlockDataFromHeader(
                  childNode,
                  componentData,
                  editedDate,
                  childNode.id
                )
                  .then((data) => response.pageData.blocks.push(data))
                  .catch((e) => handleFigmaError('F24', e));
                break;
              case componentData.components.paragraph.id:
                await generateBlockDataFromParagraph(
                  childNode,
                  editedDate,
                  childNode.id
                )
                  .then((data) => response.pageData.blocks.push(data))
                  .catch((e) => handleFigmaError('F25', e));
                break;
              case componentData.components.quote.id:
                await generateBlockDataFromQuote(
                  childNode,
                  componentData,
                  editedDate,
                  childNode.id
                )
                  .then((data) => response.pageData.blocks.push(data))
                  .catch((e) => handleFigmaError('F26', e));

                break;
              case componentData.components.list.id:
                await generateBlockDataFromList(
                  childNode,
                  editedDate,
                  childNode.id
                )
                  .then((data) => response.pageData.blocks.push(data))
                  .catch((e) => handleFigmaError('F27', e));
                break;
              case componentData.components.alert.id:
                await generateBlockDataFromAlert(
                  childNode,
                  componentData,
                  editedDate,
                  childNode.id
                )
                  .then((data) => response.pageData.blocks.push(data))
                  .catch((e) => handleFigmaError('F28', e));
                break;
              case componentData.components.code.id:
                await generateBlockDataFromCode(
                  childNode,
                  componentData,
                  editedDate,
                  childNode.id
                )
                  .then((data) => response.pageData.blocks.push(data))
                  .catch((e) => handleFigmaError('F29', e));
                break;
              case componentData.components.divider.id:
                await generateBlockDataFromDivider(editedDate, childNode.id)
                  .then((data) => response.pageData.blocks.push(data))
                  .catch((e) => handleFigmaError('F30', e));
                break;
              case componentData.components.dosAndDonts.id:
                //Probably a dehydrated frame
                await hydrateDosAndDontsFrame(
                  childNode,
                  frame,
                  i,
                  componentData
                )
                  .then((data) => response.pageData.blocks.push(data))
                  .catch((e) => handleFigmaError('F31', e));
                break;
              case componentData.components.displayFrame.id:
                //Probably a dehydrated frame
                await hydrateDisplayFrame(childNode, frame, i, componentData)
                  .then((data) => response.pageData.blocks.push(data))
                  .catch((e) => handleFigmaError('F36', e));
                break;
              case componentData.components.componentDoc.id:
                //Probably a dehydrated frame
                await hydrateComponentDoc(childNode, i, componentData)
                  .then((data) => response.pageData.blocks.push(data))
                  .catch((e) => handleFigmaError('F32', e));
                break;

              default:
                break;
            }
          } else {
            figma.ui.postMessage({
              type: 'outdated-components',
            });
          }
        } // If a component is inside a frame like frame display
        else if (childNode.type == 'FRAME') {
          let instInsideAFrame: InstanceNode = scanForInstancesInsideAFrame(
            childNode,
            []
          );

          if (instInsideAFrame) {
            let mainCompId: string;

            version = parseInt(
              instInsideAFrame.getSharedPluginData(
                FIGMA_NAMESPACE,
                FIGMA_COMPONENT_VERSION_KEY
              )
            );

            if (version == componentData.lastGenerated) {
              if (instInsideAFrame && instInsideAFrame.type == 'INSTANCE') {
                await getMainCompIdFromInstance(instInsideAFrame)
                  .then((id) => (mainCompId = id))
                  .catch((e) => handleFigmaError('F33', e));

                if (mainCompId == componentData.components.brokenLink.id) {
                  instInsideAFrame = scanForInstancesInsideAFrame(childNode, [
                    instInsideAFrame.id,
                  ]);
                  await getMainCompIdFromInstance(instInsideAFrame)
                    .then((id) => (mainCompId = id))
                    .catch((e) => handleFigmaError('F34', e));
                }

                switch (mainCompId) {
                  case componentData.components.displayFrame.id:
                    await generateBlockDataFromDisplayFrame(
                      instInsideAFrame,
                      componentData,
                      editedDate,
                      childNode.id
                    )
                      .then((data) => {
                        response.pageData.blocks.push(data);
                      })
                      .catch((e) => handleFigmaError('F35', e));
                    break;
                  case componentData.components.dosAndDonts.id:
                    await generateBlockDataFromDosAndDonts(
                      instInsideAFrame,
                      componentData,
                      editedDate,
                      childNode.id
                    )
                      .then((data) => response.pageData.blocks.push(data))
                      .catch((e) => handleFigmaError('F37', e));

                    break;
                  case componentData.components.tableCell.id:
                    await generateBlockDataFromTable(
                      instInsideAFrame,
                      mainCompId,
                      componentData,
                      editedDate,
                      childNode.id
                    )
                      .then((data) => {
                        response.pageData.blocks.push(data);
                      })
                      .catch((e) => handleFigmaError('F38', e));

                    break;

                  case componentData.components.componentDoc.id:
                    await generateBlockDataFromComponentDoc(
                      instInsideAFrame,
                      componentData,
                      editedDate,
                      childNode.id,
                      i
                    )
                      .then((data) => {
                        response.pageData.blocks.push(data);
                        response.hasComponentDocBlock = true;
                      })
                      .catch((e) => handleFigmaError('F39', e));

                    break;

                  default:
                    //console.log(instInsideAFrame);
                    //console.log(mainCompId);
                    break;
                }
              }
            } else {
              figma.ui.postMessage({
                type: 'outdated-components',
              });
            }
          }
        }
      }
    }
  }

  formatPageData(response.pageData);
  return response;
};
