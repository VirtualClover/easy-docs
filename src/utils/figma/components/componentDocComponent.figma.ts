import {
  BaseComponentData,
  BlockData,
  ComponentDocBlockData,
  ComponentSharedData,
  EMPTY_COMPONENT_SHARED_DATA,
  EMPTY_VARIANT_SHARED_DATA,
  FIGMA_COMPONENT_DOCS_KEY,
  FIGMA_COMPONENT_PREFIX,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_NAMESPACE,
  Position,
  VariantSharedData,
} from '../../constants';
import {
  convertPropObjToArr,
  generateSpecsFromNode,
} from '../getSpecsFromInstance';
import {
  generateFigmaURL,
  getDetailsFromFigmaURL,
} from '../../general/urlHandlers';
import { getComponentData, setComponentData } from '../getComponentData';

import _ from 'lodash';
import { clone } from '../../general/clone';
import { decidedAsciiForNodeType } from '../../general/decidedAsciiForNodeType';
import { generateComponentDocsSection } from './initComponents';
import { generateDisplayFrameInstance } from './displayFrameComponent.figma';
import { generateDividerInstance } from './dividerComponent.figma';
import { generateHeaderInstance } from './headerComponent.figma';
import { generateParagraphInstance } from './paragraphComponent.figma';
import { generatePointerInstance } from './pointerComponent.figma';
import { generateTableInstance } from './tableComponent.figma';
import { getPluginSettings } from '../getPluginSettings';
import { handleFigmaError } from '../handleFigmaError';
import { nodeSupportsChildren } from '../nodeSupportsChildren';
import { setNodeFills } from '../setNodeFills';

interface IntegrityCheckResponse {
  docIsComplete: boolean;
  componentDocFrame: FrameNode;
  displayFrameWrapper: FrameNode;
  parentComponent: ComponentNode | ComponentSetNode;
  componentsToSpec: ComponentNode[];
  componentDocFrameData: ComponentSharedData | null;
}

export let generateDisplayFrameCaptionForAnatomyFrame = (
  mainComponentName: string,
  variantName: string
) => {
  return `The anatomy of ${
    mainComponentName != variantName
      ? `${mainComponentName} with ${variantName}`
      : mainComponentName
  }.`;
};

export let generateHeaderContentForVariant = (
  name: string,
  isOnlyChild: boolean
) => {
  return isOnlyChild ? `Variant: ${name}` : name;
};

export let generateLayerDescription = (layer) => {
  return `${_.startCase(_.lowerCase(layer.layerType))} ${
    layer.layerType == 'INSTANCE' ? `dependant on ${layer.layerName}` : ''
  }`;
};

export async function createComponentDocComponent(parent: FrameNode) {
  let component: ComponentNode;
  let componentProperty: string;
  let settings = getPluginSettings();
  await figma
    .loadFontAsync({
      family: settings.customization.fontFamily,
      style: 'Semi Bold',
    })
    .then(() => {
      //Component
      component = figma.createComponent();
      component.resizeWithoutConstraints(300, 1);
      component.layoutMode = 'VERTICAL';
      component.primaryAxisSizingMode = 'AUTO';
      component.itemSpacing = 16;
      component.name = `${FIGMA_COMPONENT_PREFIX}Component Documentation`;

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
      tagCaption.characters = '❖ Component Documentation';
      setNodeFills(
        tagCaption,
        settings.customization.palette.component.content
      );
      tag.appendChild(tagCaption);
      tagCaption.layoutSizingHorizontal = 'HUG';
      tagCaption.fontName = {
        family: settings.customization.fontFamily,
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
      layerName: res.nodeName,
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
  parentComponent: ComponentNode | ComponentSetNode,
  componentsToSpec: ComponentNode[],
  componentData: BaseComponentData,
  fileId: string,
  componentVersion: number,
  brokenLinkCaption: string = ''
) {
  figma.notify('Generating component documentation ✍', {
    timeout: 1500,
  });
  //console.log(parentComponent);
  let returnedFrame: FrameNode;
  //Outer wrapper
  let outerWrapper = figma.createFrame();
  outerWrapper.layoutMode = 'VERTICAL';
  outerWrapper.counterAxisSizingMode = 'AUTO';
  outerWrapper.primaryAxisSizingMode = 'AUTO';
  outerWrapper.paddingBottom = 32;
  outerWrapper.itemSpacing = 0;
  outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}Component Documentation:`;
  outerWrapper.appendChild(specsComponent);
  specsComponent.layoutSizingHorizontal = 'FILL';

  if (parentComponent && parentComponent.id && componentsToSpec.length) {
    outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}Component Documentation: ${
      parentComponent.name ?? ''
    }`;

    //Description
    if (parentComponent.description) {
      await generateParagraphInstance(
        { text: parentComponent.description },
        componentVersion
      ).then((node) => {
        outerWrapper.appendChild(node);
        node.layoutSizingHorizontal = 'FILL';
      });
    }

    let componentSharedData: ComponentSharedData = clone(
      EMPTY_COMPONENT_SHARED_DATA
    );
    componentSharedData.fileId = fileId;
    componentSharedData.mainComponentId = parentComponent.id;
    componentSharedData.mainComponentName = parentComponent.name;
    componentSharedData.description = parentComponent.description;

    //Generate specs frame
    let specsFrameWrapper = figma.createFrame();
    specsFrameWrapper.layoutMode = 'VERTICAL';
    specsFrameWrapper.counterAxisSizingMode = 'AUTO';
    specsFrameWrapper.counterAxisSizingMode = 'AUTO';
    specsFrameWrapper.itemSpacing = 32;
    specsFrameWrapper.name = `${FIGMA_COMPONENT_PREFIX}Display frames for ${parentComponent.name}`;
    componentSharedData.anatomyFramesWrapper = {
      id: specsFrameWrapper.id,
      existsInFile: true,
    };

    //Generate anatomy per component variant
    for (let i = 0; i < componentsToSpec.length; i++) {
      const component = componentsToSpec[i];

      let variantSharedData: VariantSharedData = clone(
        EMPTY_VARIANT_SHARED_DATA
      );
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

      let specsFrameName = generateDisplayFrameCaptionForAnatomyFrame(
        parentComponent.name,
        component.name
      );

      let specsFrame = figma.createFrame();
      let padding = 64;
      specsFrame.resize(
        componentInstance.absoluteRenderBounds.width + padding * 2,
        componentInstance.absoluteRenderBounds.height + padding * 2
      );
      specsFrame.appendChild(componentInstance);
      componentInstance.x += padding;
      componentInstance.y += padding;
      componentInstance.constraints = {
        vertical: 'CENTER',
        horizontal: 'CENTER',
      };
      specsFrame.name = specsFrameName;
      variantSharedData.displayFrame = {
        id: specsFrame.id,
        existsInFile: true,
      };

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

      await generateHeaderInstance(
        {
          level: 5,
          text: generateHeaderContentForVariant(
            component.name,
            componentsToSpec.length > 1
          ),
        },
        componentVersion
      ).then((node) => {
        outerWrapper.appendChild(node);
        node.layoutSizingHorizontal = 'FILL';
      });

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
                text: `${i + 1}. ${decidedAsciiForNodeType(layer.layerType)} ${
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
                text: generateLayerDescription(layer),
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

        await generateDividerInstance(componentVersion).then((node) => {
          outerWrapper.appendChild(node);
          node.layoutSizingHorizontal = 'FILL';
        });
      });

      componentSharedData.variants.push(variantSharedData);
    }

    componentSharedData.documentationFrame = {
      id: outerWrapper.id,
      existsInFile: true,
    };

    outerWrapper.setSharedPluginData(
      FIGMA_NAMESPACE,
      FIGMA_COMPONENT_DOCS_KEY,
      JSON.stringify(componentSharedData)
    );

    await figma
      .getNodeByIdAsync(componentData.componentDocSection ?? '')
      .then(async (node) => {
        if (node && node.type == 'SECTION') {
          node.appendChild(outerWrapper);
          node.appendChild(specsFrameWrapper);
        } else {
          await figma
            .getNodeByIdAsync(componentData.components.componentsPage.id)
            .then(async (page) => {
              if (page && page.type == 'PAGE') {
                let componentDocSection = generateComponentDocsSection();
                componentDocSection.appendChild(outerWrapper);
                componentDocSection.appendChild(specsFrameWrapper);
                await page.loadAsync();
                page.appendChild(componentDocSection);
                componentDocSection.x = 500;
                componentData.componentDocSection = componentDocSection.id;
                setComponentData(componentData);
              }
            });
        }
      });

    returnedFrame = outerWrapper.clone();

    console.log('parent componwt written in shared plugin data');
    console.log(componentSharedData.mainComponentId);

    figma.root.setSharedPluginData(
      FIGMA_NAMESPACE,
      `${FIGMA_COMPONENT_DOCS_KEY}:${componentSharedData.mainComponentId}`,
      componentSharedData.documentationFrame.id
    );
  } else {
    //Display
    await generateDisplayFrameInstance(
      {
        frameId: '',
        fileId: '',
        frameExistsInFile: false,
        caption: brokenLinkCaption,
        maxHeight: 300,
      },
      componentVersion,
      '#E6D7FA'
    ).then((node) => {
      outerWrapper.appendChild(node);
      node.layoutSizingHorizontal = 'FILL';
      returnedFrame = outerWrapper;
    });
  }
  specsComponent.layoutSizingHorizontal = 'FILL';

  /*figma.root.setSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_COMPONENT_DOCS_KEY,
    JSON.stringify(componentSharedData)
  );*/

  /*
  parent componentId
  specs frame wrapper id
  frames id contained in the wrapper
  
  */

  return returnedFrame;
}

let componentDocFrameIntegrityCheck = async (documentationFrameId: string) => {
  let frameIsComplete = false;
  let frame: FrameNode | null;
  let data: ComponentSharedData | null;
  if (documentationFrameId) {
    await figma.getNodeByIdAsync(documentationFrameId).then((node) => {
      frame = node as FrameNode;
      if (node && node.type == 'FRAME') {
        let stringData = frame.getSharedPluginData(
          FIGMA_NAMESPACE,
          FIGMA_COMPONENT_DOCS_KEY
        );
        if (stringData) {
          data = JSON.parse(stringData);
        }
        if (data) {
          frameIsComplete = true;
        }
      }
    });
  }
  return { frameIsComplete, frame, data };
};

let componentDocIntegrityCheck = async (
  initialDisplayFrameId: string,
  parentComponentIdFallback?: string
): Promise<IntegrityCheckResponse> => {
  let docIsComplete = false;
  let isComponentFrameComplete = false;
  let isDisplayFrameWrapperComplete = true;
  let displayFrameWrapper: FrameNode | null;
  let componentDocFrame: FrameNode | null;
  let initialDisplayFrame: BaseNode | null;
  let parentComponent: ComponentNode | ComponentSetNode;
  let componentsToSpec: ComponentNode[] = [];
  let componentDocFrameData: ComponentSharedData | null;

  //console.log('gets to check');

  await figma
    .getNodeByIdAsync(initialDisplayFrameId)
    .then((node) => (initialDisplayFrame = node));

  if (initialDisplayFrame && initialDisplayFrame.type == 'FRAME') {
    // If not, check if the frame contains a component or instance
    await getComponentsToDoc(initialDisplayFrame, componentsToSpec).then(
      (component) => {
        parentComponent = component;
      }
    );

    //If it does, check if that component already has a doc frame generated
    if (parentComponent) {
      //console.log('parent component id');
      //console.log(parentComponent.id);

      let existingDocFrameId = figma.root.getSharedPluginData(
        FIGMA_NAMESPACE,
        `${FIGMA_COMPONENT_DOCS_KEY}:${parentComponent.id}`
      );

      console.log('efdid');
      console.log(existingDocFrameId);
      
      

      if (existingDocFrameId) {
        await componentDocFrameIntegrityCheck(existingDocFrameId).then(
          (res) => {
            //console.log('res');
            //console.log(res);

            isComponentFrameComplete = res.frameIsComplete;
            componentDocFrame = res.frame;
            componentDocFrameData = res.data;
          }
        );
      }
    }

    if (componentDocFrameData && typeof componentDocFrameData != 'string') {
      let variants = componentDocFrameData.variants;
      await figma
        .getNodeByIdAsync(componentDocFrameData.anatomyFramesWrapper.id)
        .then((node) => {
          if (!node || node.type != 'FRAME') {
            isDisplayFrameWrapperComplete = false;
          } else {
            displayFrameWrapper = node;
            //console.log('variant');
            //console.log(variants);
            for (const variant of variants) {
              let variantDisplayFrame = displayFrameWrapper.findChild(
                (n) => n.id === variant.displayFrame.id
              );

              if (!variantDisplayFrame) {
                isDisplayFrameWrapperComplete = false;
              }
            }
          }
        });
    }
  } else {
    //console.log('gets here x2');
    //console.log(parentComponentIdFallback);

    await figma
      .getNodeByIdAsync(parentComponentIdFallback)
      .then(async (node) => {
        //console.log(node);

        if (
          node &&
          (node.type == 'COMPONENT' || node.type == 'COMPONENT_SET')
        ) {
          await getComponentsToDoc(null, componentsToSpec, node).then(
            (component) => {
              parentComponent = component;
            }
          );
        }
      });
  }

  if (isComponentFrameComplete && isDisplayFrameWrapperComplete) {
    docIsComplete = true;
  }

  return {
    docIsComplete,
    componentDocFrame,
    displayFrameWrapper,
    parentComponent,
    componentsToSpec,
    componentDocFrameData,
  };
};

export async function getComponentsToDoc(
  containingFrame: FrameNode,
  componentsToSpec?: ComponentNode[],
  componentFallback?: ComponentNode | ComponentSetNode
): Promise<ComponentNode | ComponentSetNode> {
  let nodeToInspect: ComponentNode | ComponentSetNode;
  let frameChild: SceneNode;
  if (!componentFallback) {
    frameChild = containingFrame.findChild(
      (n) =>
        n.type === 'INSTANCE' ||
        n.type === 'COMPONENT' ||
        n.type === 'COMPONENT_SET'
    );
    switch (frameChild.type) {
      case 'INSTANCE':
        await frameChild.getMainComponentAsync().then(async (componentNode) => {
          nodeToInspect = componentNode;
        });
        break;
      case 'COMPONENT':
        nodeToInspect = frameChild;
        break;
      case 'COMPONENT_SET':
        nodeToInspect = frameChild;
        break;
      default:
        break;
    }
  } else {
    nodeToInspect = componentFallback;
  }

  let nodeParent = nodeToInspect.parent;
  if (nodeParent && nodeParent.type == 'COMPONENT_SET') {
    for (const variant of nodeParent.children) {
      if (variant.type == 'COMPONENT') {
        componentsToSpec && componentsToSpec.push(variant);
      }
    }

    return nodeParent;
  }
  if (nodeToInspect.type == 'COMPONENT_SET') {
    for (const variant of nodeToInspect.children) {
      if (variant.type == 'COMPONENT') {
        componentsToSpec && componentsToSpec.push(variant);
      }
    }

    return nodeToInspect;
  }
  if (nodeToInspect.type == 'COMPONENT') {
    componentsToSpec && componentsToSpec.push(nodeToInspect);
    return nodeToInspect;
  }
}

export async function generateComponentDocInstance(
  data: ComponentDocBlockData,
  componentVersion: number,
  preIntegrityCheckData?: IntegrityCheckResponse,
  reloadFrame: boolean = false
): Promise<FrameNode> {
  let componentData: BaseComponentData = getComponentData();
  let specsComponent: BaseNode;
  let specsFrame: FrameNode;
  let integrityCheckData: IntegrityCheckResponse | null =
    preIntegrityCheckData ?? null;

    console.log(integrityCheckData);
    

  if (!integrityCheckData) {
    await componentDocIntegrityCheck(
      data.variants[0].displayFrame.id,
      data.mainComponentId
    ).then(async (res) => {
      integrityCheckData = res;
    }).catch((e) =>
      handleFigmaError(
        'F42',
        e
      ));
  }

  if (integrityCheckData.docIsComplete && !reloadFrame) {
    return integrityCheckData.componentDocFrame.clone();
  } else {
    //If not, then we generate the component frame and delete de old ones
    await figma.getNodeByIdAsync(data.anatomyFramesWrapper.id).then((node) => {
      if (node) {
        node.remove();
      }
    }).catch((e) =>
      handleFigmaError(
        'F43',
        e
      ));
    await figma.getNodeByIdAsync(data.documentationFrame.id).then((node) => {
      if (node) {
        node.remove();
      }
    }).catch((e) =>
      handleFigmaError(
        'F44',
        e
      ));

    await figma
      .getNodeByIdAsync(componentData.components.componentDoc.id)
      .then((node) => {
        specsComponent = node;
      }).catch((e) =>
        handleFigmaError(
          'F45',
          e
        ));
    if (specsComponent.type == 'COMPONENT') {
      let instance = specsComponent.createInstance();

      instance.setSharedPluginData(
        FIGMA_NAMESPACE,
        FIGMA_COMPONENT_VERSION_KEY,
        componentVersion.toString()
      );

      await figma.ui.postMessage({
        type: 'generating-component-doc',
      });

      await generateOuterWrapper(
        instance,
        integrityCheckData.parentComponent,
        integrityCheckData.componentsToSpec,
        componentData,
        data.fileId,
        componentVersion,
        `The component referenced was deleted`
      ).then((node) => (specsFrame = node)).catch((e) =>
        handleFigmaError(
          'F46',
          e
        ));

      figma.ui.postMessage({
        type: 'finished-generating-component-doc',
      });

      return specsFrame;
      //instance.set
    }

    return null;
  }
}

export async function generateBlockDataFromComponentDoc(
  instNode: InstanceNode,
  componentData: BaseComponentData,
  lastEdited: number = Date.now(),
  figmaNodeId: string = '',
  indexInFrame: number = 0,
  isHydratedInstance: boolean = false
): Promise<BlockData> {
  let url =
    instNode.componentProperties[
      componentData.components.componentDoc.componentSourceProp
    ].value ?? '';
  let componentIdFromData: string = '';
  let blockType = 'componentDoc';
  let blockData = {
    type: blockType,
    lastEdited,
    figmaNodeId,
    data: clone(EMPTY_COMPONENT_SHARED_DATA) as ComponentSharedData,
  };
  blockData.data.variants.push(EMPTY_VARIANT_SHARED_DATA);
  let parsedData: ComponentSharedData = clone(blockData.data);

  let frameDetails = getDetailsFromFigmaURL(url, 'decode');
  
  // Get master component from frame data
  if (instNode.parent && instNode.parent.type == 'FRAME') {
    let storedData = instNode.parent.getSharedPluginData(
      FIGMA_NAMESPACE,
      FIGMA_COMPONENT_DOCS_KEY
    );
    //console.log('stored data');
    //console.log(storedData);

    if (storedData) {
      parsedData = JSON.parse(storedData);
      componentIdFromData = parsedData.mainComponentId;
    }
  }

  if (frameDetails.fileId && frameDetails.frameId) {
    await componentDocIntegrityCheck(
      frameDetails.frameId,
      componentIdFromData
    ).then(async (res) => {
      if (res.docIsComplete) {
        blockData.data = parsedData;
      } else {
        parsedData.variants[0].displayFrame.id = frameDetails.frameId;
        //Regenerate block
        await generateComponentDocInstance(
          parsedData,
          componentData.lastGenerated,
          res
        ).then((n) => {
          let parentFrame: FrameNode;
          let nodeToRemove: InstanceNode;
          if (isHydratedInstance) {
            parentFrame = instNode.parent as FrameNode;

            console.log('parent frame');
            console.log(parentFrame);
            
          } else {
            parentFrame = instNode.parent.parent as FrameNode;
            console.log('parent parent frame');
            console.log(parentFrame);
          }
          parentFrame.insertChild(indexInFrame, n);
          n.layoutSizingHorizontal = 'FILL';
          let dehydratedNode = parentFrame.children[indexInFrame + 1];
          dehydratedNode.remove();
          blockData.figmaNodeId = n.id;
        }).catch((e) =>
          handleFigmaError(
            'F40',
            e
          ));
      }
    }).catch((e) =>
      handleFigmaError(
        'F41',
        e
      ));
  }

  return blockData;
}

export async function hydrateComponentDoc(
  instance: InstanceNode,
  indexInFrame: number,
  componentData: BaseComponentData
): Promise<BlockData> {
  let block;
  //componentsToSpec &&
  await generateBlockDataFromComponentDoc(
    instance,
    componentData,
    Date.now(),
    instance.id,
    indexInFrame,
    true
  ).then((data) => (block = data));
  return block;
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
