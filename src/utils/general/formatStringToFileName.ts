import * as _ from 'lodash';

export let formatStringToFileName = (string: string): string => {
  let maxNameLength = 25;
  return _.snakeCase(string.replace(/[\W_]+/g, '')).substring(0, maxNameLength);
};
