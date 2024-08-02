import {
  BaseComponentData,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants/constants';
import {
  BlockData,
  ComponentDocBlockData,
  EMPTY_COMPONENT_SHARED_DATA,
  EMPTY_VARIANT_SHARED_DATA,
  FIGMA_COMPONENT_DOCS_KEY,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_NAMESPACE,
  Position,
  VariantSharedData,
} from '../../constants';

import { DEFAULT_FONT_FAMILIES } from '../../../styles/base';
import { generateDisplayFrameInstance } from './displayFrameComponent.figma';
import {
  generateFigmaURL,
  getDetailsFromFigmaURL,
  validateFigmaURL,
} from '../../general/urlHandlers';
import { generateParagraphInstance } from './paragraphComponent.figma';
import { generateTableInstance } from './tableComponent.figma';
import { getComponentData } from '../getComponentData';
import { getPluginSettings } from '../getPluginSettings';
import { setNodeFills } from '../setNodeFills';
import { generatePointerInstance } from './pointerComponent.figma';
import { nodeSupportsChildren } from '../nodeSupportsChildren';
import {
  convertPropObjToArr,
  generateSpecsFromNode,
} from '../getSpecsFromInstance';
import { generateHeaderInstance } from './headerComponent.figma';
import _ from 'lodash';
import { clone } from '../../general/clone';

export async function createComponentDocComponent(parent: FrameNode) {
  let component: ComponentNode;
  let componentProperty: string;
  await figma
    .loadFontAsync({ family: DEFAULT_FONT_FAMILIES[0], style: 'Semi Bold' })
    .then(() => {
      //Component

      let settings = getPluginSettings();

      component = figma.createComponent();
      component.resizeWithoutConstraints(300, 1);
      component.layoutMode = 'VERTICAL';
      component.primaryAxisSizingMode = 'AUTO';
      component.itemSpacing = 16;
      component.name = `${FIGMA_COMPONENT_PREFIX}Specs`;

      //Tag
      let tag = figma.createFrame();
      tag.layoutMode = 'HORIZONTAL';
      tag.itemSpacing = 8;
      setNodeFills(tag, '#E6D7FA');
      tag.verticalPadding = 8;
      tag.horizontalPadding = 8;
      tag.cornerRadius = 4;
      tag.primaryAxisSizingMode = 'AUTO';
      tag.counterAxisSizingMode = 'AUTO';
      //tag.layoutSizingHorizontal = 'HUG';

      //Tag caption
      let tagCaption = figma.createText();
      tagCaption.characters = '❖ Component specs';
      setNodeFills(tagCaption, '#7E4CC0');
      tag.appendChild(tagCaption);
      tagCaption.layoutSizingHorizontal = 'HUG';
      tagCaption.fontName = {
        family: DEFAULT_FONT_FAMILIES[0],
        style: 'Semi Bold',
      };

      component.appendChild(tag);

      //InstanceWrapper
      let instanceWrapper = figma.createFrame();
      instanceWrapper.resize(0.01, 0.01);
      instanceWrapper.clipsContent = true;
      instanceWrapper.name = 'sourceWrapper';
      component.appendChild(instanceWrapper);

      //TODO Create text node and add the link
      let textNode = figma.createText();
      textNode.characters = 'Source here';
      textNode.resize(0.01, 0.01);

      instanceWrapper.appendChild(textNode);
      componentProperty = component.addComponentProperty(
        'url',
        'TEXT',
        'Source here'
      );
      textNode.componentPropertyReferences = {
        characters: componentProperty,
      };

      parent.appendChild(component);
    });
  return {
    id: component.id,
    componentSourceProp: componentProperty,
  };
}

interface PointerCoordsObj {
  top: number[];
  left: number[];
  right: number[];
  bottom: number[];
}

type ParentComponentData = { name: string; id: string } | null;

async function processComponentChildLayer(
  variantSharedData: VariantSharedData,
  layer: any,
  componentVersion: number,
  specsFrame: FrameNode,
  instance: InstanceNode | ComponentNode,
  pointerCoords: PointerCoordsObj,
  avoidInstances: boolean = true
) {
  if (
    layer.absoluteRenderBounds &&
    layer.type != 'MASK' &&
    layer.type != 'GROUP'
  ) {
    await generateSpecsFromNode(layer as FrameNode, avoidInstances).then(
      async (res) => {
        if (res) {
          variantSharedData.layers.push({
            layerName: res.nodeName,
            layerType: res.nodeType,
            properties: res.propertiesObj,
          });

          let instanceRenderBounds = {
            left: instance.absoluteRenderBounds.x,
            right:
              instance.absoluteRenderBounds.x +
              instance.absoluteRenderBounds.width,
          };
          let layerAbsoluteRenderBounds = {
            left: layer.absoluteRenderBounds.x,
            right:
              layer.absoluteRenderBounds.x + layer.absoluteRenderBounds.width,
          };

          let orientation : Position =
            Math.abs(
              instanceRenderBounds.left - layerAbsoluteRenderBounds.left
            ) >
            Math.abs(
              instanceRenderBounds.right - layerAbsoluteRenderBounds.left
            )
              ? 'right'
              : 'left';

          let layerCenter = {
            vertical: instance.y + layer.y + layer.height / 2,
            horiozntal: instance.x + layer.x + layer.width / 2,
          };

          if (
            orientation == 'right' &&
            !pointerCoords.right.some(
              (value) =>
                value > layerCenter.vertical - 10 &&
                value < layerCenter.vertical + 10
            )
          ) {
          } else {
            if (
              pointerCoords.left.some(
                (value) =>
                  value > layerCenter.vertical - 10 &&
                  value < layerCenter.vertical + 10
              )
            ) {
              if (
                !pointerCoords.top.some(
                  (value) =>
                    value > layerCenter.horiozntal - 10 &&
                    value < layerCenter.horiozntal + 10
                )
              ) {
                orientation = 'top';
              } else {
                if (
                  !pointerCoords.bottom.some(
                    (value) =>
                      value > layerCenter.horiozntal - 10 &&
                      value < layerCenter.horiozntal + 10
                  )
                ) {
                  orientation = 'bottom';
                }
              }
            }
          }

          await generatePointerInstance(
            variantSharedData.layers.length,
            orientation,
            componentVersion
          ).then((node) => {
            specsFrame.appendChild(node);
            node.layoutPositioning = 'ABSOLUTE';
            node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };

            switch (orientation) {
              case 'left':
                node.x = instance.x + layer.x - node.width;
                if (node.x + node.width > instance.x) {
                  let offset = layer.x;
                  node.resize(node.width + offset, node.height);
                  node.x -= offset;
                }
                node.y =
                  instance.y + layer.y + layer.height / 2 - node.height / 2; //+(layer.height/2)-(node.height/2);
                pointerCoords[orientation].push(
                  instance.y + layer.y + layer.height / 2
                );

                break;
              case 'top':
                node.x =
                  instance.x + layer.x + layer.width / 2 - node.width / 2;
                node.y = instance.y + layer.y - node.height; //+(layer.height/2)-(node.height/2);
                if (node.y > layer.y - node.height) {
                  let offset = layer.y;
                  node.resize(node.width, node.height + offset);
                  node.y -= offset;
                }
                pointerCoords[orientation].push(
                  instance.x + layer.x + layer.width / 2
                );
                break;

              case 'right':
                node.x = instance.x + layer.x + layer.width;
                if (instance.x + instance.width > node.x) {
                  let offset =
                    instance.x + instance.width - node.x + node.width;
                  node.resize(offset, node.height);
                }
                node.y =
                  instance.y + layer.y + layer.height / 2 - node.height / 2; //+(layer.height/2)-(node.height/2);
                pointerCoords[orientation].push(
                  instance.y + layer.y + layer.height / 2
                );
                break;

              case 'bottom':
                node.x =
                  instance.x + layer.x + layer.width / 2 - node.width / 2;
                node.y = instance.y + layer.y + layer.height; //+(layer.height/2)-(node.height/2);
                pointerCoords.bottom.push(
                  instance.x + layer.x + layer.width / 2
                );
                break;

              default:
                break;
            }
          });
        }
      }
    );
  }

  if (
    layer.type != 'INSTANCE' &&
    nodeSupportsChildren(layer) &&
    layer.children.length
  ) {
    for (const child of layer.children) {
      await processComponentChildLayer(
        variantSharedData,
        child,
        componentVersion,
        specsFrame,
        instance,
        pointerCoords
      );
    }
  }
}

let processComponentLayer = async (
  variantSharedData: VariantSharedData,
  componentVersion: number,
  specsFrame: FrameNode,
  instance: InstanceNode,
  pointerCoords: PointerCoordsObj
) => {
  await generateSpecsFromNode(instance).then((res) => {
    variantSharedData.layers.push({
      layerName: `❖ ${res.nodeName}`,
      layerType: 'Main Component',
      properties: res.propertiesObj,
    });
  });

  await generatePointerInstance(
    variantSharedData.layers.length,
    'left',
    componentVersion
  ).then((node) => {
    specsFrame.appendChild(node);
    node.layoutPositioning = 'ABSOLUTE';
    node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
    node.x = instance.x - node.width;
    node.y = instance.y + instance.height / 2 - node.height / 2; //+(layer.height/2)-(node.height/2);
    pointerCoords.left.push(instance.y + instance.height / 2);
  });
};

async function generateOuterWrapper(
  specsComponent: InstanceNode,
  parentComponent: ParentComponentData,
  componentsToSpec: ComponentNode[],
  componentData: BaseComponentData,
  fileId: string,
  brokenLinkCaption?: string,
  componentVersion?: number
) {
  //console.log(parentComponent);
  let outerWrapper = figma.createFrame();
  outerWrapper.layoutMode = 'VERTICAL';
  outerWrapper.counterAxisSizingMode = 'AUTO';
  outerWrapper.primaryAxisSizingMode = 'AUTO';
  outerWrapper.paddingBottom = 32;
  outerWrapper.itemSpacing = 0;
  outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}Component Specs:`;
  outerWrapper.appendChild(specsComponent);

  if (parentComponent && parentComponent.id && componentsToSpec.length) {
    outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}Component Specs: ${
      parentComponent.name ?? ''
    }`;
    //Outer wrapper
    let componentSharedData = clone(EMPTY_COMPONENT_SHARED_DATA);
    componentSharedData.mainComponentId = parentComponent.id;
    componentSharedData.mainComponentName = parentComponent.name;

    //Generate specs frame
    let specsFrameWrapper = figma.createFrame();
    specsFrameWrapper.layoutMode = 'VERTICAL';
    specsFrameWrapper.counterAxisSizingMode = 'AUTO';
    specsFrameWrapper.counterAxisSizingMode = 'AUTO';
    specsFrameWrapper.name = `${FIGMA_COMPONENT_PREFIX}Display frames for ${parentComponent.name}`;
    componentSharedData.parentFrameId = specsFrameWrapper.id;

    //Generate specs per component variant
    for (let i = 0; i < componentsToSpec.length; i++) {
      const component = componentsToSpec[i];

      let variantSharedData = clone(EMPTY_VARIANT_SHARED_DATA);
      variantSharedData.variantId = component.id;
      variantSharedData.variantName = component.name;

      //Generate instance of component variant to display
      let componentInstance = component.createInstance();
      let properties = componentInstance.componentProperties;
      for (const property in properties) {
        if (properties[property].type == 'BOOLEAN') {
          componentInstance.setProperties({
            [property]: true,
          });
        }
      }

      let specsFrameName = `The anatomy of ${
        parentComponent.name != component.name
          ? `${parentComponent.name} with ${component.name}`
          : parentComponent.name
      }.`;

      let specsFrame = figma.createFrame();
      specsFrame.appendChild(componentInstance);
      specsFrame.verticalPadding = 64;
      specsFrame.horizontalPadding = 64;
      specsFrame.layoutMode = 'VERTICAL';
      specsFrame.counterAxisSizingMode = 'AUTO';
      specsFrame.counterAxisSizingMode = 'AUTO';
      specsFrame.primaryAxisAlignItems = 'CENTER';
      specsFrame.counterAxisAlignItems = 'CENTER';
      specsFrame.name = specsFrameName;
      specsFrameWrapper.appendChild(specsFrame);
      variantSharedData.frameId = specsFrame.id;

      let pointerCoords: PointerCoordsObj = {
        left: [],
        top: [],
        right: [],
        bottom: [],
      };

      //Generate specs for first layer, in this case, the component layer
      await processComponentLayer(
        variantSharedData,
        componentVersion,
        specsFrame,
        componentInstance,
        pointerCoords
      );

      //Generate specs for other layers
      for (const child of componentInstance.children) {
        await processComponentChildLayer(
          variantSharedData,
          child,
          componentVersion,
          specsFrame,
          componentInstance,
          pointerCoords,
          true
        );
      }

      specsFrameWrapper.setSharedPluginData(
        FIGMA_NAMESPACE,
        FIGMA_COMPONENT_VERSION_KEY,
        componentVersion.toString()
      );

      //Display
      await generateDisplayFrameInstance(
        {
          frameId: specsFrame.id,
          fileId: fileId,
          frameExistsInFile: true,
          caption: specsFrameName,
        },
        componentVersion,
        '#E6D7FA',
        300
      ).then(async (node) => {
        if (i === 0) {
          specsComponent.setProperties({
            [componentData.components.componentDoc.componentSourceProp]:
              generateFigmaURL(fileId, specsFrame.id, 'share'),
          });
        }

        outerWrapper.appendChild(node);
        node.layoutSizingHorizontal = 'FILL';

        //generateHeaderInstance({level:5,text:`${}`})
        //console.log('layers proc');
        //console.log(variantSharedData);

        //Specs table
        if (variantSharedData.layers.length) {
          for (let i = 0; i < variantSharedData.layers.length; i++) {
            const layer = variantSharedData.layers[i];
            await generateHeaderInstance(
              {
                level: 6,
                text: `${i + 1}. ${layer.layerType == 'INSTANCE' ? '◇' : ''} ${
                  layer.layerName
                }`,
              },
              componentVersion
            ).then((node) => {
              outerWrapper.appendChild(node);
              node.layoutSizingHorizontal = 'FILL';
            });
            await generateParagraphInstance(
              {
                text: `${_.startCase(_.lowerCase(layer.layerType))} ${
                  layer.layerType == 'INSTANCE'
                    ? `dependant on ${layer.layerName}`
                    : ''
                }`,
              },
              componentVersion
            ).then((node) => {
              outerWrapper.appendChild(node);
              node.layoutSizingHorizontal = 'FILL';
            });
            if (layer.properties) {
              await generateTableInstance(
                {
                  withHeadings: true,
                  content: [
                    ['Property', 'Value', 'Source'],
                    ...convertPropObjToArr(layer.properties),
                  ],
                },
                componentVersion
              ).then((node) => {
                outerWrapper.appendChild(node);
                node.layoutSizingHorizontal = 'FILL';
              });
            }
          }
        }
      });
    }
  } else {
    //Display
    generateDisplayFrameInstance(
      {
        frameId: '',
        fileId: '',
        frameExistsInFile: false,
        caption: ``,
        maxHeight: 300,
      },
      componentVersion,
      '#E6D7FA'
    ).then((node) => {
      outerWrapper.appendChild(node);
      node.layoutSizingHorizontal = 'FILL';
    });
  }
  specsComponent.layoutSizingHorizontal = 'FILL';

  /*figma.root.setSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_COMPONENT_DOCS_KEY,
    JSON.stringify(componentSharedData)
  );*/

  return outerWrapper;
}

export function getComponentsToDoc(
  node: ComponentNode | ComponentSetNode,
  componentsToSpec: ComponentNode[]
) {
  let specChildParent = node.parent;
  if (specChildParent && specChildParent.type == 'COMPONENT_SET') {
    for (const variant of specChildParent.children) {
      if (variant.type == 'COMPONENT') {
        componentsToSpec.push(variant);
      }
    }

    return { name: specChildParent.name, id: specChildParent.id };
  } else {
    componentsToSpec.push(node as ComponentNode);
    return { name: node.name, id: node.id };
  }
}

export async function generateComponentDocInstance(
  data: ComponentDocBlockData,
  componentVersion: number
): Promise<FrameNode> {
  let componentData: BaseComponentData = getComponentData();
  let parentComponent: { name: string; id: string };
  let specsComponent: BaseNode;
  let componentsToSpec: ComponentNode[] = []; // We define an array because a component can have multiple variants
  let specsFrame: FrameNode;
  await figma
    .getNodeByIdAsync(data.frameToDisplay.frameId)
    .then(async (node) => {
      if (node && node.type === 'FRAME') {
        let specChild = node.findChild(
          (n) =>
            n.type === 'INSTANCE' ||
            n.type === 'COMPONENT' ||
            n.type === 'COMPONENT_SET'
        );

        switch (specChild.type) {
          case 'INSTANCE':
            await specChild
              .getMainComponentAsync()
              .then(async (componentNode) => {
                parentComponent = getComponentsToDoc(
                  componentNode,
                  componentsToSpec
                );
              });
            break;
          case 'COMPONENT':
            parentComponent = getComponentsToDoc(specChild, componentsToSpec);
            break;
          case 'COMPONENT_SET':
            parentComponent = getComponentsToDoc(specChild, componentsToSpec);
            break;
          default:
            break;
        }
      }
    });
  await figma
    .getNodeByIdAsync(componentData.components.componentDoc.id)
    .then((node) => {
      specsComponent = node;
    });
  if (specsComponent.type == 'COMPONENT') {
    let instance = specsComponent.createInstance();

    await generateOuterWrapper(
      instance,
      parentComponent,
      componentsToSpec,
      componentData,
      data.frameToDisplay.fileId,
      `The component referenced was deleted`,
      componentVersion
    ).then((node) => (specsFrame = node));

    instance.setSharedPluginData(
      FIGMA_NAMESPACE,
      FIGMA_COMPONENT_VERSION_KEY,
      componentVersion.toString()
    );

    return specsFrame;
    //instance.set
  }
  return null;
}

export async function generateBlockDataFromComponentDoc(
  instNode: InstanceNode,
  componentData: BaseComponentData,
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  // TODO JUST CHECK IF THE PARENT FRAME ID CHANGED, DON'T REGENERATE THE WHOLE DOC!!!!!! maybe?

  let blockType = 'componentDoc';
  let url =
    instNode.componentProperties[
      componentData.components.componentDoc.componentSourceProp
    ].value ?? '';
  let frameDetails;
  let frameExistsInFile: boolean | undefined = undefined;
  let componentName: string;
  let componentsToSpec = [];
  let blockData = {
    type: blockType,
    lastEdited,
    figmaNodeId,
    data: {
      componentName: '',
      frameToDisplay: {
        frameId: '',
        fileId: '',
        frameExistsInFile,
      },
      documentation: [],
    },
  };
  if (validateFigmaURL(url as string)) {
    frameDetails = getDetailsFromFigmaURL(<string>url, 'decode');

    await figma.getNodeByIdAsync(frameDetails.frameId).then(async (node) => {
      if (node && node.type === 'FRAME') {
        let specChild = node.findChild(
          (n) => n.type === 'INSTANCE'
        ) as InstanceNode;
        await specChild.getMainComponentAsync().then((componentNode) => {
          let parentComponent = getComponentsToDoc(
            componentNode,
            componentsToSpec
          );
          componentName = parentComponent.name;
        });
      }
    });

    await figma
      .getNodeByIdAsync(frameDetails.frameId)
      .then((node) => {
        frameExistsInFile = node != null ? true : false;
        blockData = {
          type: blockType,
          lastEdited,
          figmaNodeId,
          data: {
            componentName,
            frameToDisplay: { ...frameDetails, frameExistsInFile },
            documentation: [],
          },
        };
      })
      .catch((e) => console.error(e));
  }
  return blockData;
}
