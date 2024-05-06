/**
 * Creates an instance from a main component id
 * @param key
 * @returns
 */
export async function createInstance(key: string): Promise<InstanceNode> {
  let instance: InstanceNode;
  await figma
    .importComponentByKeyAsync(key)
    .then((res) => {
      instance = res.createInstance();
    })
    .catch((err) => console.error(err));
  return instance;
}
