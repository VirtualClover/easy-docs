import { BaseFileData } from '../../constants';

export function generateParagraphInstance(data): InstanceNode {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let component = figma.getNodeById(componentData.paragraph.id);
  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.paragraph.contentProp]: data.text.replace('&nbsp;', ' '),
    });
    return instance;
    //instance.set
  }
  return null;
}
