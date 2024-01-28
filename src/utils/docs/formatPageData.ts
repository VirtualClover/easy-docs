import { PageData } from '../constants';

export function formatPageData(page: PageData) {
  let i = 0;
  while (page.blocks[i].type != 'header') {
    i++;
  }
  let firstHeaderBlock = page.blocks[i];
  page.title = firstHeaderBlock.data.text;
}
