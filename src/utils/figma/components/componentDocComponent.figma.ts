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
let difference = function (a, b) {
  return Math.abs(a - b);
};

async function processComponentChildLayer(
  variantSharedData: VariantSharedData,
  layer: FrameNode | GroupNode | InstanceNode,
  componentVersion: number,
  specsFrame: FrameNode,
  instance: InstanceNode | ComponentNode,
  pointerCoords: PointerCoordsObj,
  avoidInstances: boolean = true
) {
  if (layer.absoluteRenderBounds && !layer.isMask && layer.type != 'GROUP') {
    await generateSpecsFromNode(layer as FrameNode, avoidInstances).then(
      async (res) => {
        if (res) {
          variantSharedData.layers.push({
            layerName: res.nodeName,
            layerType: res.nodeType,
            properties: res.propertiesObj,
          });

          let orientation: Position;

          let layerCenter = {
            y:
              layer.absoluteRenderBounds.y +
              layer.absoluteRenderBounds.height / 2,
            x:
              layer.absoluteRenderBounds.x +
              layer.absoluteRenderBounds.width / 2,
          };

          let layerCoords = {
            top: layer.absoluteRenderBounds.y,
            left: layer.absoluteRenderBounds.x,
            bottom:
              layer.absoluteRenderBounds.y + layer.absoluteRenderBounds.height,
            right:
              layer.absoluteRenderBounds.x + layer.absoluteRenderBounds.width,
          };

          let instanceCoords = {
            top: instance.absoluteRenderBounds.y,
            left: instance.absoluteRenderBounds.x,
            bottom:
              instance.absoluteRenderBounds.y +
              instance.absoluteRenderBounds.height,
            right:
              instance.absoluteRenderBounds.x +
              instance.absoluteRenderBounds.width,
          };

          let positionOffset = 0.4;

          let distances = [
            {
              distance: difference(instanceCoords.top, layerCoords.top),
              keyCoordPoint: layerCenter.x,
              orientation: 'top',
            },
            {
              distance: difference(instanceCoords.bottom, layerCoords.bottom),
              keyCoordPoint: layerCenter.x,
              orientation: 'bottom',
            },
            {
              distance: difference(instanceCoords.left, layerCoords.left),
              keyCoordPoint: layerCenter.y,
              orientation: 'left',
            },
            {
              distance: difference(instanceCoords.right, layerCoords.right),
              keyCoordPoint: layerCenter.y,
              orientation: 'right',
            },
          ];

          let currentAttemp = 0;
          let needsOffset = false;
          distances.sort((a, b) => a.distance - b.distance);

          while (currentAttemp < 3) {
            if (
              !pointerCoords[distances[currentAttemp].orientation].some(
                (value) =>
                  value > distances[currentAttemp].keyCoordPoint - 10 &&
                  value < distances[currentAttemp].keyCoordPoint + 10
              ) &&
              distances[currentAttemp].distance <=
                instance.absoluteRenderBounds.width / 2
            ) {
              orientation = distances[currentAttemp].orientation as Position;
              break;
            } else {
              currentAttemp++;
            }
          }

          if (currentAttemp >= 3) {
            orientation = distances[0].orientation as Position;
            needsOffset = true;
          }

          await generatePointerInstance(
            variantSharedData.layers.length,
            orientation,
            componentVersion
          ).then((node) => {
            node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };

            switch (orientation) {
              case 'left':
                node.x = layer.absoluteRenderBounds.x - node.width;
                if (
                  layer.absoluteRenderBounds.x > instance.absoluteRenderBounds.x
                ) {
                  let offset = difference(
                    layer.absoluteRenderBounds.x,
                    instanceCoords.left
                  );
                  node.resize(node.width + offset, node.height);
                  node.x -= offset;
                }
                node.y =
                  layerCenter.y -
                  node.height / 2 +
                  (needsOffset ? node.height * positionOffset : 0);
                pointerCoords[orientation].push(layerCenter.y);

                break;
              case 'top':
                node.x =
                  layerCenter.x -
                  node.width / 2 +
                  (needsOffset ? node.width * positionOffset : 0);
                node.y = layer.absoluteRenderBounds.y - node.height;
                if (
                  layer.absoluteRenderBounds.y > instance.absoluteRenderBounds.y
                ) {
                  let offset = difference(
                    layer.absoluteRenderBounds.y,
                    instanceCoords.top
                  );
                  node.resize(node.width, node.height + offset);
                  node.y -= offset;
                }
                pointerCoords[orientation].push(layerCenter.x);
                break;

              case 'right':
                node.x = layerCoords.right;
                if (node.x < instanceCoords.right) {
                  let offset = difference(node.x, instanceCoords.right);
                  node.resize(offset + node.width, node.height);
                }
                node.y =
                  layerCenter.y -
                  node.height / 2 +
                  (needsOffset ? node.height * positionOffset : 0);
                pointerCoords[orientation].push(layerCenter.y);
                break;

              case 'bottom':
                node.x =
                  layerCenter.x -
                  node.width / 2 +
                  (needsOffset ? node.width * positionOffset : 0);
                node.y = layerCoords.bottom;
                if (layerCoords.bottom < instanceCoords.bottom) {
                  let offset = difference(node.y, instanceCoords.bottom);
                  node.resize(node.width, node.height + offset);
                }
                pointerCoords.bottom.push(layerCenter.x);
                break;

              default:
                break;
            }

            specsFrame.appendChild(node);
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
        child as FrameNode,
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
    node.x = instance.absoluteRenderBounds.x - node.width;
    node.y =
      instance.absoluteRenderBounds.y +
      instance.absoluteRenderBounds.height / 2 -
      node.absoluteRenderBounds.height / 2; //+(layer.height/2)-(node.height/2);
    specsFrame.appendChild(node);
    node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
    pointerCoords.left.push(node.y);
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
      let padding = 64;
      specsFrame.appendChild(componentInstance);
      specsFrame.resize(
        componentInstance.absoluteRenderBounds.width + padding * 2,
        componentInstance.absoluteRenderBounds.height + padding * 2
      );
      componentInstance.x += padding;
      componentInstance.y += padding;
      componentInstance.constraints = {
        vertical: 'CENTER',
        horizontal: 'CENTER',
      };
      specsFrame.name = specsFrameName;
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
          child as FrameNode,
          componentVersion,
          specsFrame,
          componentInstance,
          pointerCoords,
          true
        );
      }

      specsFrameWrapper.appendChild(specsFrame);
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

/*

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

*/
