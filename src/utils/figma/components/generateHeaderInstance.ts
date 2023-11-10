import { BaseFileData } from '../../constants';

export function generateHeaderInstance(data) {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let componentSet = figma.getNodeById(componentData.header.id);
  if (componentSet.type == 'COMPONENT_SET') {
    let component = componentSet.children[0] as ComponentNode;
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.header.contentProp]: data.text,
      [componentData.header.levelProp.key]: `${data.level}`,
    });
    return instance;
    //instance.set
  }
  return null;
}
