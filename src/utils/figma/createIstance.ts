import { NodeWithChildren } from './ExtendedNodeTypings';

export async function createInstance(key: string) {
  let instance: InstanceNode;
    await figma
    .importComponentByKeyAsync(key)
    .then((res) => {
      instance = res.createInstance();
    })
    .catch((err) => console.error(err));
    return instance;
}
