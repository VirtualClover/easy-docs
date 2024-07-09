export let remapObjKey = (o, oldKey: string, newKey: string) => {
  if (oldKey !== newKey) {
    let propDescriptor = Object.getOwnPropertyDescriptor(o, oldKey);
    if (propDescriptor != undefined) {
      Object.defineProperty(o, newKey, propDescriptor);
      delete o[oldKey];
    }
  }
};
