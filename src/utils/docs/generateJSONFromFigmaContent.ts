import {
  BaseFileData,
  DocData,
  EMPTY_DOC_OBJECT,
  FIGMA_LAST_EDITED_KEY,
  FIGMA_NAMESPACE,
  PageData,
} from '../constants';

import { formatPageData } from './formatPageData';
import { getUserDetailsInFigma } from '../figma/getUserDetailsFigma';
import { getDetailsFromFigmaURL } from './figmaURLHandlers';

export async function generateJSONFromFigmaContent(
  section: SectionNode
): Promise<DocData> {
  let JSONData: DocData = {
    title: section.name,
    pages: [],
    sectionId: section.id,
    author: {
      changesMadeIn: 'figma',
      user: getUserDetailsInFigma(),
    },
    lastEdited: Date.now().toString(),
  };

  let stringData = figma.root.getSharedPluginData('EasyDocs', 'components');
  let componentData: BaseFileData = JSON.parse(stringData);

  if (section.children) {
    let children = section.children;

    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      if (child.type == 'FRAME') {
        JSONData.pages.push(
          await generatePageDataFromFrame(child, componentData)
        );
      }
    }

    return JSONData;
  }

  return EMPTY_DOC_OBJECT;
}

async function generatePageDataFromFrame(
  frame: FrameNode,
  componentData: BaseFileData
): Promise<PageData> {
  let pageData: PageData = {
    blocks: [],
    title: '',
    frameId: frame.id,
  };
  if (frame.children) {
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
      if (childNode.type == 'INSTANCE') {
        let mainCompId: string;
        await childNode.getMainComponentAsync().then((component) => {
          mainCompId =
            component.parent.type == 'COMPONENT_SET'
              ? component.parent.id
              : component.id;
        });
        switch (mainCompId) {
          case componentData.header.id:
            let headerContent =
              childNode.componentProperties[componentData.header.contentProp]
                .value;
            pageData.blocks.push({
              type: 'header',
              ...objEssentials,
              data: {
                text: headerContent,
                level: parseInt(
                  childNode.componentProperties[
                    componentData.header.levelProp.key
                  ].value as string,
                  10
                ),
              },
            });
            break;
          case componentData.paragraph.id:
            pageData.blocks.push({
              type: 'paragraph',
              ...objEssentials,
              data: {
                text: childNode.componentProperties[
                  componentData.paragraph.contentProp
                ].value,
              },
            });
            break;
          case componentData.quote.id:
            pageData.blocks.push({
              type: 'quote',
              ...objEssentials,
              data: {
                text: childNode.componentProperties[
                  componentData.quote.contentProp
                ].value,
                caption:
                  childNode.componentProperties[componentData.quote.authorProp]
                    .value,
                alignment: 'left',
              },
            });
            //console.log(pageData);

            break;
          default:
            break;
        }
      } // If a comppnent is inside a frame like frame display
      else if (childNode.type == 'FRAME') {
        let instInsideAFrame: InstanceNode = childNode.findChild(
          (n) => n.type == 'INSTANCE'
        ) as InstanceNode;
        if (instInsideAFrame && instInsideAFrame.type == 'INSTANCE') {
          let mainCompId: string;
          await instInsideAFrame.getMainComponentAsync().then((component) => {
            mainCompId =
              component.parent.type == 'COMPONENT_SET'
                ? component.parent.id
                : component.id;
          });

          switch (mainCompId) {
            case componentData.displayFrame.id:
              let url =
                instInsideAFrame.componentProperties[
                  componentData.displayFrame.sourceProp
                ].value;
              let frameDetails;
              if (url != '') {
                frameDetails = getDetailsFromFigmaURL(<string>url, 'decode');
              }
              let frameExistsInFile: boolean;
              await figma
                .getNodeByIdAsync(frameDetails.frameId)
                .then((node) => {
                  frameExistsInFile = node != null ? true : false;
                  pageData.blocks.push({
                    type: 'displayFrame',
                    ...objEssentials,
                    data: {
                      frameId: frameDetails.frameId,
                      fileId: frameDetails.fileId,
                      frameExistsInFile,
                      caption:
                        instInsideAFrame.componentProperties[
                          componentData.displayFrame.captionProp
                        ].value,
                    },
                  });
                })
                .catch((e) => console.error(e));

              break;
            default:
              break;
          }
        }
      }
    }
  }

  formatPageData(pageData);
  frame.name = pageData.title;
  return pageData;
}
