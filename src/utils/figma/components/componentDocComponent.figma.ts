import {
  BaseComponentData,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants/constants';
import {
  BlockData,
  ComponentDocBlockData,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_NAMESPACE,
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

async function addPointerToLayer(
  layerCount: number,
  componentVersion: number,
  specsFrame: FrameNode,
  instance: InstanceNode,
  layer: FrameNode | InstanceNode,
  pointerCoords: any
) {
  //console.log(pointerCoords);

  if (
    pointerCoords.left.indexOf(instance.y + layer.y + layer.height / 2) == -1
  ) {
    await generatePointerInstance(layerCount, 'left', componentVersion).then(
      (node) => {
        specsFrame.appendChild(node);
        node.layoutPositioning = 'ABSOLUTE';
        node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
        node.x = instance.x + layer.x - node.width;
        node.y = instance.y + layer.y + layer.height / 2 - node.height / 2; //+(layer.height/2)-(node.height/2);
        pointerCoords.left.push(instance.y + layer.y + layer.height / 2);
      }
    );
    return '';
  }
  if (pointerCoords.top.indexOf(instance.x + layer.x + layer.width / 2) == -1) {
    await generatePointerInstance(layerCount, 'top', componentVersion).then(
      (node) => {
        specsFrame.appendChild(node);
        node.layoutPositioning = 'ABSOLUTE';
        node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
        node.x = instance.x + layer.x + layer.width / 2 - node.width / 2;
        node.y = instance.y + layer.y - node.height; //+(layer.height/2)-(node.height/2);
        pointerCoords.top.push(instance.x + layer.x + layer.width / 2);
      }
    );
    return '';
  }
  if (
    pointerCoords.right.indexOf(instance.y + layer.y + layer.height / 2) == -1
  ) {
    //TODO
    await generatePointerInstance(layerCount, 'right', componentVersion).then(
      (node) => {
        specsFrame.appendChild(node);
        node.layoutPositioning = 'ABSOLUTE';
        node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
        node.x = instance.x + layer.x + layer.width;
        node.y = instance.y + layer.y + layer.height / 2 - node.height / 2; //+(layer.height/2)-(node.height/2);
        pointerCoords.right.push(instance.y + layer.y + layer.height / 2);
      }
    );
    return '';
  }

  if (
    pointerCoords.bottom.indexOf(instance.x + layer.x + layer.width / 2) == -1
  ) {
    //TODO
    await generatePointerInstance(layerCount, 'bottom', componentVersion).then(
      (node) => {
        specsFrame.appendChild(node);
        node.layoutPositioning = 'ABSOLUTE';
        node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
        node.x = instance.x + layer.x + layer.width / 2 - node.width / 2;
        node.y = instance.y + layer.y + layer.height; //+(layer.height/2)-(node.height/2);
        pointerCoords.bottom.push(instance.x + layer.x + layer.width / 2);
      }
    );
    return '';
  }

  await generatePointerInstance(layerCount, 'left', componentVersion).then(
    (node) => {
      specsFrame.appendChild(node);
      node.layoutPositioning = 'ABSOLUTE';
      node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
      node.x = instance.x + layer.x - node.width;
      node.y = instance.y + layer.y + layer.height / 2 - node.height / 2; //+(layer.height/2)-(node.height/2);
      pointerCoords.left.push(instance.y + layer.y + layer.height / 2);
    }
  );
}

async function processLayer(
  layersProcessed: string[],
  layer: any,
  componentVersion: number,
  specsFrame: FrameNode,
  instance: InstanceNode | ComponentNode,
  pointerCoords: {
    top: number[];
    left: number[];
    right: number[];
    bottom: number[];
  }
) {
  layersProcessed.push(layer.id);
  let ln = layer as FrameNode;

  if (
    pointerCoords.left.indexOf(instance.y + layer.y + layer.height / 2) == -1
  ) {
    await generatePointerInstance(
      layersProcessed.length,
      'left',
      componentVersion
    ).then((node) => {
      specsFrame.appendChild(node);
      node.layoutPositioning = 'ABSOLUTE';
      node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
      node.x = instance.x + layer.x - node.width;
      if (node.x > instance.x) {
        let offset = instance.x - node.x - node.width;
        node.resize(offset, node.height);
      }
      node.y = instance.y + layer.y + layer.height / 2 - node.height / 2; //+(layer.height/2)-(node.height/2);
      pointerCoords.left.push(instance.y + layer.y + layer.height / 2);
    });
    return '';
  }
  if (pointerCoords.top.indexOf(instance.x + layer.x + layer.width / 2) == -1) {
    await generatePointerInstance(
      layersProcessed.length,
      'top',
      componentVersion
    ).then((node) => {
      specsFrame.appendChild(node);
      node.layoutPositioning = 'ABSOLUTE';
      node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
      node.x = instance.x + layer.x + layer.width / 2 - node.width / 2;
      node.y = instance.y + layer.y - node.height; //+(layer.height/2)-(node.height/2);
      pointerCoords.top.push(instance.x + layer.x + layer.width / 2);
    });
    return '';
  }
  if (
    pointerCoords.right.indexOf(instance.y + layer.y + layer.height / 2) == -1
  ) {
    //TODO
    await generatePointerInstance(
      layersProcessed.length,
      'right',
      componentVersion
    ).then((node) => {
      specsFrame.appendChild(node);
      node.layoutPositioning = 'ABSOLUTE';
      node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
      node.x = instance.x + layer.x + layer.width;
      if (instance.x + instance.width > node.x) {
        let offset = instance.x + instance.width - node.x + node.width;
        node.resize(offset, node.height);
      }
      node.y = instance.y + layer.y + layer.height / 2 - node.height / 2; //+(layer.height/2)-(node.height/2);
      pointerCoords.right.push(instance.y + layer.y + layer.height / 2);
    });
    return '';
  }

  if (
    pointerCoords.bottom.indexOf(instance.x + layer.x + layer.width / 2) == -1
  ) {
    //TODO
    await generatePointerInstance(
      layersProcessed.length,
      'bottom',
      componentVersion
    ).then((node) => {
      specsFrame.appendChild(node);
      node.layoutPositioning = 'ABSOLUTE';
      node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
      node.x = instance.x + layer.x + layer.width / 2 - node.width / 2;
      node.y = instance.y + layer.y + layer.height; //+(layer.height/2)-(node.height/2);
      pointerCoords.bottom.push(instance.x + layer.x + layer.width / 2);
    });
    return '';
  }

  await generatePointerInstance(
    layersProcessed.length,
    'left',
    componentVersion
  ).then((node) => {
    specsFrame.appendChild(node);
    node.layoutPositioning = 'ABSOLUTE';
    node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
    node.x = instance.x + layer.x - node.width;
    node.y = instance.y + layer.y + layer.height / 2 - node.height / 2; //+(layer.height/2)-(node.height/2);
    pointerCoords.left.push(instance.y + layer.y + layer.height / 2);
  });
  if (nodeSupportsChildren(layer) && layer.children.length) {
    for (const child of layer.children) {
      await processLayer(
        layersProcessed,
        child,
        componentVersion,
        specsFrame,
        instance,
        pointerCoords
      );
    }
  }
}

async function generateOuterWrapper(
  specsComponent: InstanceNode,
  componentName: string,
  componentsToSpec: ComponentNode[],
  componentData: BaseComponentData,
  fileId: string,
  brokenLinkCaption?: string,
  componentVersion?: number
) {
  //Outer wrapper
  let outerWrapper = figma.createFrame();
  outerWrapper.layoutMode = 'VERTICAL';
  outerWrapper.counterAxisSizingMode = 'AUTO';
  outerWrapper.primaryAxisSizingMode = 'AUTO';
  outerWrapper.paddingBottom = 32;
  outerWrapper.itemSpacing = 0;
  outerWrapper.name = `${FIGMA_COMPONENT_PREFIX}Component Specs: ${
    componentName ?? 'No component'
  }`;
  outerWrapper.appendChild(specsComponent);
  if (componentsToSpec.length) {
    let specsFrameWrapper = figma.createFrame();
    specsFrameWrapper.layoutMode = 'VERTICAL';
    specsFrameWrapper.counterAxisSizingMode = 'AUTO';
    specsFrameWrapper.counterAxisSizingMode = 'AUTO';
    specsFrameWrapper.name = `${FIGMA_COMPONENT_PREFIX}Display frames for ${componentName}`;
    for (let i = 0; i < componentsToSpec.length; i++) {
      const component = componentsToSpec[i];
      //Generate specs frame

      let componentInstance = component.createInstance();
      let layersProcessed = [];
      layersProcessed.push(componentInstance.id);

      let specsFrame = figma.createFrame();
      specsFrame.appendChild(componentInstance);
      specsFrame.verticalPadding = 64;
      specsFrame.horizontalPadding = 64;
      specsFrame.layoutMode = 'VERTICAL';
      specsFrame.counterAxisSizingMode = 'AUTO';
      specsFrame.counterAxisSizingMode = 'AUTO';
      specsFrame.primaryAxisAlignItems = 'CENTER';
      specsFrame.counterAxisAlignItems = 'CENTER';
      specsFrameWrapper.appendChild(specsFrame);

      let pointerCoords = {
        left: [],
        top: [],
        right: [],
        bottom: [],
      };

      await generatePointerInstance(
        layersProcessed.length,
        'left',
        componentVersion
      ).then((node) => {
        specsFrame.appendChild(node);
        node.layoutPositioning = 'ABSOLUTE';
        node.constraints = { vertical: 'CENTER', horizontal: 'CENTER' };
        node.x = componentInstance.x - node.width;
        node.y =
          componentInstance.y + componentInstance.height / 2 - node.height / 2; //+(layer.height/2)-(node.height/2);
        pointerCoords.left.push(
          componentInstance.y + componentInstance.height / 2
        );
      });

      for (const child of componentInstance.children) {
        await processLayer(
          layersProcessed,
          child,
          componentVersion,
          specsFrame,
          componentInstance,
          pointerCoords
        );
      }

      //console.log(layers);

      specsFrameWrapper.setSharedPluginData(
        FIGMA_NAMESPACE,
        FIGMA_COMPONENT_VERSION_KEY,
        componentVersion.toString()
      );

      //Display
      generateDisplayFrameInstance(
        {
          frameId: specsFrame.id,
          fileId: fileId,
          frameExistsInFile: true,
          caption: `${component.name}`,
        },
        componentVersion,
        '#E6D7FA',
        300
      ).then((node) => {
        if (i === 0) {
          specsComponent.setProperties({
            [componentData.components.componentDoc.componentSourceProp]:
              generateFigmaURL(fileId, specsFrame.id, 'share'),
          });
        }

        outerWrapper.appendChild(node);
        node.layoutSizingHorizontal = 'FILL';
      });

      //Specs table
      //generateTableInstance()
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

  //component.layoutSizingHorizontal = 'FILL';
  return outerWrapper;
}

export async function getComponentsToDoc(
  node: ComponentNode | ComponentSetNode,
  componentsToSpec: ComponentNode[]
) {
  let componentName: string;
  let specChildParent = node.parent;
  if (specChildParent.type == 'COMPONENT_SET') {
    for (const variant of specChildParent.children) {
      if (variant.type == 'COMPONENT') {
        componentsToSpec.push(variant);
      }
    }
    return specChildParent.name;
  } else {
    componentsToSpec.push(node as ComponentNode);
    return node.name;
  }
}

export async function generateComponentDocInstance(
  data: ComponentDocBlockData,
  componentVersion: number
): Promise<FrameNode> {
  let componentData: BaseComponentData = getComponentData();
  let componentName: string;
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
            await specChild.getMainComponentAsync().then((componentNode) => {
              getComponentsToDoc(componentNode, componentsToSpec).then(
                (name) => (componentName = name)
              );
            });
            break;
          case 'COMPONENT':
            getComponentsToDoc(specChild, componentsToSpec).then(
              (name) => (componentName = name)
            );
            break;
          case 'COMPONENT_SET':
            getComponentsToDoc(specChild, componentsToSpec).then(
              (name) => (componentName = name)
            );
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
      componentName,
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
  // TODO JUST CHECK IF THE FRAME ID CHANGED, DON'T REGENERATE THE WHOLE DOC!!!!!! maybe?

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
          getComponentsToDoc(componentNode, componentsToSpec).then(
            (name) => (componentName = name)
          );
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
