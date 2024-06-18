import {
  BlockData,
  DEFAULT_SETTINGS,
  DEFAULT_STATUSES,
  FIGMA_COMPONENT_PREFIX,
  StatusType,
} from '../../constants';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../general/cleanseTextData';
import {
  errorIcon,
  infoIcon,
  successIcon,
  warningIcon,
} from '../../../assets/svgs';

import { BaseFileData } from '../../constants';
import { setNodeFills } from '../setNodeFills';
import { setNodeStrokeColor } from '../setNodeStrokeColor';

function decideAssetsToDisplay(type: StatusType) {
  switch (type) {
    case 'success':
      return {
        palette: DEFAULT_SETTINGS.customization.palette.status.success,
        icon: successIcon,
      };
      break;
    case 'warning':
      return {
        palette: DEFAULT_SETTINGS.customization.palette.status.warning,
        icon: warningIcon,
      };
      break;
    case 'info':
      return {
        palette: DEFAULT_SETTINGS.customization.palette.status.info,
        icon: infoIcon,
      };
      break;
    case 'danger':
      return {
        palette: DEFAULT_SETTINGS.customization.palette.status.error,
        icon: errorIcon,
      };
      break;
    default:
      return {
        palette: DEFAULT_SETTINGS.customization.palette.status.info,
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
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }).then(() => {
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
      contentNode.fontName = { family: 'Inter', style: 'Regular' };
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
  console.log(componentSet.componentPropertyDefinitions);
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
  data
): Promise<InstanceNode | null> {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let componentSet: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.alert.id)
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
      [componentData.alert.contentProp]: data.message,
      [componentData.alert.typeProp.key]: `${data.type}`,
    });

    let textNode = instance.findOne((n) => n.type == 'TEXT') as TextNode;
    await figma
      .loadFontAsync({ family: 'Inter', style: 'Regular' })
      .then(
        () => (textNode.textAlignHorizontal = data.align.toLocaleUpperCase())
      );

    return instance;
  }

  return null;
}

export async function generateBlockDataFromAlert(
  instNode: InstanceNode,
  componentData: BaseFileData,
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  let textNode = instNode.findOne((n) => n.type == 'TEXT') as TextNode;
  return {
    type: 'alert',
    lastEdited,
    figmaNodeId,
    data: {
      type: instNode.componentProperties[componentData.dosAndDonts.typeProp.key]
        .value,
      message: encodeStringForHTML(
        instNode.componentProperties[componentData.alert.contentProp]
          .value as string
      ),
      align: textNode.textAlignHorizontal.toLocaleLowerCase(),
    },
  };
}
