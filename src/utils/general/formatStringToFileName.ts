import * as _ from 'lodash';

export let formatStringToFileName = (string: string): string => {
  return _.snakeCase(string.replace(/[\W_]+/g, ''));
};
