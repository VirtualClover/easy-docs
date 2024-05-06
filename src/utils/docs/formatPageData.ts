import { PageData } from '../constants';

/**
 * Formats the page data, mostly updates the header
 * @param page
 */
export function formatPageData(page: PageData) {
  let i = 0;
  while (page.blocks[i].type != 'header') {
    i++;
  }
  let firstHeaderBlock = page.blocks[i];
  page.title = firstHeaderBlock.data.text;
}
