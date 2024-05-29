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
import {
  getDetailsFromFigmaURL,
  validateFigmaURL,
} from '../general/urlHandlers';
import { encodeStringForHTML } from '../cleanseTextData';
import { clone } from '../clone';

export async function generateJSONFromFigmaContent(
  section: SectionNode
): Promise<DocData> {
  let JSONData: DocData = {
    title: encodeStringForHTML(section.name),
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
            let headerContent = encodeStringForHTML(
              childNode.componentProperties[componentData.header.contentProp]
                .value as string
            );
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
                text: encodeStringForHTML(
                  childNode.componentProperties[
                    componentData.paragraph.contentProp
                  ].value as string
                ),
              },
            });
            break;
          case componentData.quote.id:
            pageData.blocks.push({
              type: 'quote',
              ...objEssentials,
              data: {
                text: encodeStringForHTML(
                  childNode.componentProperties[componentData.quote.contentProp]
                    .value as string
                ),
                caption: encodeStringForHTML(
                  childNode.componentProperties[componentData.quote.authorProp]
                    .value as string
                ),
                alignment: 'left',
              },
            });
            //console.log(pageData);

            break;
          case componentData.list.id:
            let unformattedContent = childNode.componentProperties[
              componentData.list.contentProp
            ].value as string;
            let content = clone(encodeStringForHTML(unformattedContent));
            console.log('unformattedcontent');
            console.log(unformattedContent);
            let emptyLastItem: boolean = false;
            if (content.match(/\n+$/gm)) {
              emptyLastItem = true;
              console.log('empty line true!');
            }
            let arr = [];
            if (content) {
              arr = content.split('\n');
            }
            let listStyle: string = 'unordered';
            let textNode = childNode.findOne(
              (n) => n.type === 'TEXT'
            ) as TextNode;
            if (textNode.characters.length) {
              let unformattedStyle = textNode.getRangeListOptions(
                0,
                textNode.characters.length
              ) as TextListOptions;
              if (unformattedStyle.type && unformattedStyle.type != 'NONE') {
                listStyle = unformattedStyle.type.toLowerCase();
              } else {
                await figma
                  .loadFontAsync({ family: 'Inter', style: 'Regular' })
                  .then(() => {
                    textNode.setRangeListOptions(
                      0,
                      textNode.characters.length,
                      {
                        type: 'UNORDERED',
                      }
                    );
                  });
              }
            }
            pageData.blocks.push({
              type: 'list',
              ...objEssentials,
              data: {
                items: arr,
                style: listStyle,
              },
            });
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
              {
                let url =
                  instInsideAFrame.componentProperties[
                    componentData.displayFrame.sourceProp
                  ].value ?? '';
                let frameDetails;
                let frameExistsInFile: boolean = false;
                if (validateFigmaURL(url as string)) {
                  frameDetails = getDetailsFromFigmaURL(<string>url, 'decode');
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
                          caption: encodeStringForHTML(
                            instInsideAFrame.componentProperties[
                              componentData.displayFrame.captionProp
                            ].value as string
                          ),
                        },
                      });
                    })
                    .catch((e) => console.error(e));
                } else {
                  pageData.blocks.push({
                    type: 'displayFrame',
                    ...objEssentials,
                    data: {
                      frameId: '',
                      fileId: '',
                      frameExistsInFile,
                      caption: encodeStringForHTML(
                        instInsideAFrame.componentProperties[
                          componentData.displayFrame.captionProp
                        ].value as string
                      ),
                    },
                  });
                }
              }
              break;
            case componentData.dosAndDonts.id:
              {
                let url =
                  instInsideAFrame.componentProperties[
                    componentData.dosAndDonts.sourceProp
                  ].value ?? '';
                let frameDetails;
                let frameExistsInFile: boolean = false;
                if (validateFigmaURL(url as string)) {
                  frameDetails = getDetailsFromFigmaURL(<string>url, 'decode');
                  await figma
                    .getNodeByIdAsync(frameDetails.frameId)
                    .then((node) => {
                      frameExistsInFile = node != null ? true : false;
                      pageData.blocks.push({
                        type: 'dosAndDonts',
                        ...objEssentials,
                        data: {
                          frameId: frameDetails.frameId,
                          fileId: frameDetails.fileId,
                          type: instInsideAFrame.componentProperties[
                            componentData.dosAndDonts.typeProp.key
                          ].value,
                          frameExistsInFile,
                          caption: encodeStringForHTML(
                            instInsideAFrame.componentProperties[
                              componentData.dosAndDonts.captionProp
                            ].value as string
                          ),
                        },
                      });
                    })
                    .catch((e) => console.error(e));
                } else {
                  pageData.blocks.push({
                    type: 'dosAndDonts',
                    ...objEssentials,
                    data: {
                      frameId: '',
                      fileId: '',
                      type: instInsideAFrame.componentProperties[
                        componentData.dosAndDonts.typeProp.key
                      ].value,
                      frameExistsInFile,
                      caption: encodeStringForHTML(
                        instInsideAFrame.componentProperties[
                          componentData.dosAndDonts.captionProp
                        ].value as string
                      ),
                    },
                  });
                }
              }

              break;

            default:
              break;
          }
        }
      }
    }
  }

  formatPageData(pageData);
  //frame.name = encodeStringForHTML(pageData.title);
  return pageData;
}
