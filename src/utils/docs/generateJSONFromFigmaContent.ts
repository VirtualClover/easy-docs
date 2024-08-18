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
} from '../figma/components/componentDocComponent.figma';
import {
  generateBlockDataFromDisplayFrame,
  hydrateDisplayFrame,
} from '../figma/components/displayFrameComponent.figma';
import {
  generateBlockDataFromDosAndDonts,
  hydrateDosAndDontsFrame,
} from '../figma/components/dosAndDontsComponent.figma';

import { encodeStringForHTML } from '../general/cleanseTextData';
import { formatPageData } from './formatPageData';
import { generateBlockDataFromAlert } from '../figma/components/AlertComponent.figma';
import { generateBlockDataFromCode } from '../figma/components/codeComponent.figma';
import { generateBlockDataFromDivider } from '../figma/components/dividerComponent.figma';
import { generateBlockDataFromHeader } from '../figma/components/headerComponent.figma';
import { generateBlockDataFromList } from '../figma/components/listComponent.figma';
import { generateBlockDataFromParagraph } from '../figma/components/paragraphComponent.figma';
import { generateBlockDataFromQuote } from '../figma/components/quoteComponent.figma';
import { generateBlockDataFromTable } from '../figma/components/tableComponent.figma';
import { getMainCompIdFromInstance } from '../figma/getMainCompIdFromInstance';
import { getPluginSettings } from '../figma/getPluginSettings';
import { getUserDetailsInFigma } from '../figma/getUserDetailsFigma';
import { handleFigmaError } from '../figma/handleFigmaError';
import { scanForInstancesInsideAFrame } from '../figma/scans';
import { styleFrame } from '../figma/styleFrame';

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
          .catch((e) =>
            handleFigmaError(
              `There was an error generating a the page data from the Figma content`,
              'ED-F0022',
              e
            )
          );
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
      let editedDate =
        parseInt(
          childNode.getSharedPluginData(FIGMA_NAMESPACE, FIGMA_LAST_EDITED_KEY),
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
          await getMainCompIdFromInstance(childNode).then(
            (id) => (mainCompId = id)
          );

          switch (mainCompId) {
            case componentData.components.header.id:
              generateBlockDataFromHeader(
                childNode,
                componentData,
                editedDate,
                childNode.id
              ).then((data) => response.pageData.blocks.push(data));
              break;
            case componentData.components.paragraph.id:
              generateBlockDataFromParagraph(
                childNode,
                editedDate,
                childNode.id
              ).then((data) => response.pageData.blocks.push(data));
              break;
            case componentData.components.quote.id:
              generateBlockDataFromQuote(
                childNode,
                componentData,
                editedDate,
                childNode.id
              ).then((data) => response.pageData.blocks.push(data));

              break;
            case componentData.components.list.id:
              generateBlockDataFromList(
                childNode,
                editedDate,
                childNode.id
              ).then((data) => response.pageData.blocks.push(data));
              break;
            case componentData.components.alert.id:
              generateBlockDataFromAlert(
                childNode,
                componentData,
                editedDate,
                childNode.id
              ).then((data) => response.pageData.blocks.push(data));
              break;
            case componentData.components.code.id:
              generateBlockDataFromCode(
                childNode,
                componentData,
                editedDate,
                childNode.id
              ).then((data) => response.pageData.blocks.push(data));
              break;
            case componentData.components.divider.id:
              generateBlockDataFromDivider(editedDate, childNode.id).then(
                (data) => response.pageData.blocks.push(data)
              );
              break;
            case componentData.components.dosAndDonts.id:
              //Probably a dehydrated frame
              await hydrateDosAndDontsFrame(
                childNode,
                frame,
                i,
                componentData
              ).then((data) => response.pageData.blocks.push(data));
              break;
            case componentData.components.displayFrame.id:
              //Probably a dehydrated frame
              await hydrateDisplayFrame(
                childNode,
                frame,
                i,
                componentData
              ).then((data) => response.pageData.blocks.push(data));
              break;
            case componentData.components.componentDoc.id:
              //Probably a dehydrated frame
              await hydrateComponentDoc(childNode, i, componentData).then(
                (data) => response.pageData.blocks.push(data)
              );
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
        let mainCompId: string;

        version = parseInt(
          instInsideAFrame.getSharedPluginData(
            FIGMA_NAMESPACE,
            FIGMA_COMPONENT_VERSION_KEY
          )
        );

        if (version == componentData.lastGenerated) {
          if (instInsideAFrame && instInsideAFrame.type == 'INSTANCE') {
            await getMainCompIdFromInstance(instInsideAFrame).then(
              (id) => (mainCompId = id)
            );

            if (mainCompId == componentData.components.brokenLink.id) {
              instInsideAFrame = scanForInstancesInsideAFrame(childNode, [
                instInsideAFrame.id,
              ]);
              await getMainCompIdFromInstance(instInsideAFrame).then(
                (id) => (mainCompId = id)
              );
            }

            switch (mainCompId) {
              case componentData.components.displayFrame.id:
                await generateBlockDataFromDisplayFrame(
                  instInsideAFrame,
                  componentData,
                  editedDate,
                  childNode.id
                ).then((data) => {
                  response.pageData.blocks.push(data);
                });
                break;
              case componentData.components.dosAndDonts.id:
                await generateBlockDataFromDosAndDonts(
                  instInsideAFrame,
                  componentData,
                  editedDate,
                  childNode.id
                ).then((data) => response.pageData.blocks.push(data));

                break;
              case componentData.components.tableCell.id:
                await generateBlockDataFromTable(
                  instInsideAFrame,
                  mainCompId,
                  componentData,
                  editedDate,
                  childNode.id
                ).then((data) => {
                  response.pageData.blocks.push(data);
                });

                break;

              case componentData.components.componentDoc.id:
                await generateBlockDataFromComponentDoc(
                  instInsideAFrame,
                  componentData,
                  editedDate,
                  childNode.id,
                  i
                ).then((data) => {
                  response.pageData.blocks.push(data);
                  response.hasComponentDocBlock = true;
                });

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

  formatPageData(response.pageData);
  return response;
};
