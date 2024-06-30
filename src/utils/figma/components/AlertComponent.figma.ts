import {
  AlertBlockData,
  BlockData,
  FIGMA_COMPONENT_DATA_KEY,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_NAMESPACE,
  TextAlignment,
  UpperCaseTextAligment,
} from '../../constants';
import {
  BaseComponentData,
  DEFAULT_STATUSES,
  FIGMA_COMPONENT_PREFIX,
  StatusType,
} from '../../constants/constants';
import {
  errorIcon,
  infoIcon,
  successIcon,
  warningIcon,
} from '../../../assets/svgs';

import { DEFAULT_FONT_FAMILIES } from '../../../styles/base';
import { encodeStringForHTML } from '../../general/cleanseTextData';
import { getPluginSettings } from '../getPluginSettings';
import { setNodeFills } from '../setNodeFills';
import { setNodeStrokeColor } from '../setNodeStrokeColor';

function decideAssetsToDisplay(type: StatusType) {
  let settings = getPluginSettings();

  switch (type) {
    case 'success':
      return {
        palette: settings.customization.palette.status.success,
        icon: successIcon,
      };
      break;
    case 'warning':
      return {
        palette: settings.customization.palette.status.warning,
        icon: warningIcon,
      };
      break;
    case 'info':
      return {
        palette: settings.customization.palette.status.info,
        icon: infoIcon,
      };
      break;
    case 'danger':
      return {
        palette: settings.customization.palette.status.error,
        icon: errorIcon,
      };
      break;
    default:
      return {
        palette: settings.customization.palette.status.info,
        icon: infoIcon,
      };
      break;
  }
}

export async function createAlertComponent(
  parent: FrameNode,
  statusTypes = DEFAULT_STATUSES
) {
  let set: ComponentNode[] = [];
  let componentSet: ComponentSetNode;
  let contentProperty: string;
  let statusPropKey: string = 'type';
  await figma
    .loadFontAsync({ family: DEFAULT_FONT_FAMILIES[0], style: 'Regular' })
    .then(() => {
      for (let i = 0; i < statusTypes.length; i++) {
        const currentStatus = statusTypes[i];
        let assets = decideAssetsToDisplay(currentStatus);
        let component = figma.createComponent();
        component.resizeWithoutConstraints(400, 20);
        component.layoutMode = 'HORIZONTAL';
        component.counterAxisSizingMode = 'AUTO';
        component.primaryAxisSizingMode = 'FIXED';
        component.name = `${statusPropKey}=${currentStatus}`;
        component.paddingTop = 8;
        component.paddingBottom = 32;
        //Inner wrapper
        let innerWrapper = figma.createFrame();
        innerWrapper.name = 'innerWrapper';
        innerWrapper.resizeWithoutConstraints(400, 20);
        innerWrapper.layoutMode = 'HORIZONTAL';
        innerWrapper.counterAxisSizingMode = 'AUTO';
        innerWrapper.primaryAxisSizingMode = 'FIXED';
        innerWrapper.strokeLeftWeight = 16;
        innerWrapper.paddingLeft = 32;
        innerWrapper.paddingRight = 16;
        innerWrapper.paddingTop = 16;
        innerWrapper.paddingBottom = 16;
        innerWrapper.itemSpacing = 8;
        innerWrapper.cornerRadius = 8;
        setNodeStrokeColor(innerWrapper, assets.palette.default);
        setNodeFills(innerWrapper, assets.palette.muted);
        component.appendChild(innerWrapper);
        innerWrapper.layoutSizingHorizontal = 'FILL';
        //Alert icon
        let captionIcon = figma.createNodeFromSvg(assets.icon);
        captionIcon.resize(24, 24);
        captionIcon.name = 'alertIcon';
        let shape = captionIcon.findOne((n) => n.type === 'VECTOR');
        setNodeFills(shape, assets.palette.content);
        innerWrapper.appendChild(captionIcon);
        //Content
        let contentNode = figma.createText();
        contentNode.fontName = {
          family: DEFAULT_FONT_FAMILIES[0],
          style: 'Regular',
        };
        contentNode.fontSize = 18;
        contentNode.characters = 'Alert';
        setNodeFills(contentNode, assets.palette.content);
        innerWrapper.appendChild(contentNode);
        contentNode.layoutSizingHorizontal = 'FILL';
        contentProperty = component.addComponentProperty(
          'content',
          'TEXT',
          'Alert'
        );
        contentNode.componentPropertyReferences = {
          characters: contentProperty,
        };
        parent.appendChild(component);
        set.push(component);
      }

      componentSet = figma.combineAsVariants(set, parent);
      componentSet.layoutMode = 'VERTICAL';
      componentSet.itemSpacing = 90;
      componentSet.name = `${FIGMA_COMPONENT_PREFIX}Alert`;
    });
  return {
    id: componentSet.id,
    contentProp: Object.keys(componentSet.componentPropertyDefinitions)[0],
    typeProp: {
      key: statusPropKey,
      variables:
        componentSet.componentPropertyDefinitions[statusPropKey].variantOptions,
    },
  };
}

export async function generateAlertInstance(
  data: AlertBlockData,
  componentVersion: number
): Promise<InstanceNode | null> {
  let componentData: BaseComponentData = JSON.parse(
    figma.root.getSharedPluginData(FIGMA_NAMESPACE, FIGMA_COMPONENT_DATA_KEY)
  );
  let componentSet: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.components.alert.id)
    .then((node) => {
      componentSet = node;
    })
    .catch((e) => {
      console.error(e);
    });

  if (componentSet.type == 'COMPONENT_SET') {
    let component = componentSet.children[0] as ComponentNode;

    let instance = component.createInstance();

    instance.setProperties({
      [componentData.components.alert.contentProp]: data.message,
      [componentData.components.alert.typeProp.key]: `${data.type}`,
    });

    let textNode = instance.findOne((n) => n.type == 'TEXT') as TextNode;
    await figma
      .loadFontAsync({ family: DEFAULT_FONT_FAMILIES[0], style: 'Regular' })
      .then(
        () =>
          (textNode.textAlignHorizontal =
            data.align.toLocaleUpperCase() as UpperCaseTextAligment)
      );

    instance.setSharedPluginData(
      FIGMA_NAMESPACE,
      FIGMA_COMPONENT_VERSION_KEY,
      componentVersion.toString()
    );
    return instance;
  }

  return null;
}

export async function generateBlockDataFromAlert(
  instNode: InstanceNode,
  componentData: BaseComponentData,
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  let textNode = instNode.findOne((n) => n.type == 'TEXT') as TextNode;
  return {
    type: 'alert',
    lastEdited,
    figmaNodeId,
    data: {
      type: instNode.componentProperties[
        componentData.components.dosAndDonts.typeProp.key
      ].value as StatusType,
      message: encodeStringForHTML(
        instNode.componentProperties[componentData.components.alert.contentProp]
          .value as string
      ),
      align: textNode.textAlignHorizontal.toLocaleLowerCase() as TextAlignment,
    },
  };
}
