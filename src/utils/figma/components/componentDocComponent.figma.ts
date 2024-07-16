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

export async function createcomponentDocComponent(parent: FrameNode) {
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
    for (let i = 0; i < componentsToSpec.length; i++) {
      const component = componentsToSpec[i];
      //Generate specs frame

      let specsFrame = figma.createFrame();
      specsFrame.appendChild(component.createInstance());
      specsFrame.verticalPadding = 32;
      specsFrame.horizontalPadding = 32;

      specsFrame.setSharedPluginData(
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
        '#E6D7FA'
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
  componentName: string,
  componentsToSpec: ComponentNode[]
) {
  let specChildParent = node.parent;
  if (specChildParent.type == 'COMPONENT_SET') {
    componentName = specChildParent.name;
    for (const variant of specChildParent.children) {
      if (variant.type == 'COMPONENT') {
        componentsToSpec.push(variant);
      }
    }
  } else {
    componentName = node.name;
    componentsToSpec.push(node as ComponentNode);
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
              getComponentsToDoc(
                componentNode,
                componentName,
                componentsToSpec
              );
            });
            break;
          case 'COMPONENT':
            getComponentsToDoc(specChild, componentName, componentsToSpec);
            break;
          case 'COMPONENT_SET':
            getComponentsToDoc(specChild, componentName, componentsToSpec);
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
          getComponentsToDoc(componentNode, componentName, componentsToSpec);
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
