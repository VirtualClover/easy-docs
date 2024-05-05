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

export function generateJSONFromFigmaContent(section: SectionNode): DocData {
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
        JSONData.pages.push(generatePageDataFromFrame(child, componentData));
      }
    }

    /*console.log('generated from figma');
    console.log(JSONData);*/

    return JSONData;
  }

  return EMPTY_DOC_OBJECT;
}

function generatePageDataFromFrame(
  frame: FrameNode,
  componentData: BaseFileData
): PageData {
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
      if (childNode.type == 'INSTANCE') {
        let mainCompId =
          childNode.mainComponent.parent.type == 'COMPONENT_SET'
            ? childNode.mainComponent.parent.id
            : childNode.mainComponent.id;
        switch (mainCompId) {
          case componentData.header.id:
            let headerContent =
              childNode.componentProperties[componentData.header.contentProp]
                .value;
            pageData.blocks.push({
              type: 'header',
              lastEdited: editedDate,
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
            if (!pageData.title && typeof headerContent === 'string') {
              pageData.title = headerContent;
            }
            break;
          case componentData.paragraph.id:
            pageData.blocks.push({
              type: 'paragraph',
              lastEdited: editedDate,
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
              lastEdited: editedDate,
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
        let instInsideAFrame = childNode.findChild((n) => n.type == 'INSTANCE');
        if (instInsideAFrame && instInsideAFrame.type == 'INSTANCE') {
          let mainCompId =
            instInsideAFrame.mainComponent.parent.type == 'COMPONENT_SET'
              ? instInsideAFrame.mainComponent.parent.id
              : instInsideAFrame.mainComponent.id;

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
              pageData.blocks.push({
                type: 'displayFrame',
                lastEdited: editedDate,
                data: {
                  frameId: frameDetails.frameId,
                  fileId: frameDetails.fileId,
                  caption:
                    instInsideAFrame.componentProperties[
                      componentData.displayFrame.captionProp
                    ].value,
                },
              });

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
