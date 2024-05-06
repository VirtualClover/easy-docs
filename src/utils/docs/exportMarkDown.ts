import { DEFAULT_SETTINGS, DocData, PageData } from '../constants';

import { generateFigmaURL } from './figmaURLHandlers';

/**
 * Generates markdown from the JSON page doc object
 * @param data
 * @returns
 */
export function exportMarkdown(data: PageData): string {
  console.log(data);

  let markdown = [];

  for (let i = 0; i < data.blocks.length; i++) {
    const block = data.blocks[i];

    switch (block.type) {
      case 'header':
        markdown.push(`${'#'.repeat(block.data.level)} ${block.data.text}`);
        break;
      case 'paragraph':
        markdown.push(`${block.data.text}`);
        break;
      case 'quote':
        markdown.push(`> ${block.data.text}  \n> ${block.data.caption}`);
        break;
      case 'displayFrame':
        markdown.push(
          `<iframe style="border: 1px solid ${
            DEFAULT_SETTINGS.palette.divider
          }" src="${generateFigmaURL(
            block.data.fileId,
            block.data.frameId,
            'embed'
          )}" allowfullscreen></iframe>  \n${
            block.data.caption ? `\n*${block.data.caption}*` : ''
          }`
        );
        break;
    }
  }

  return markdown.join('  \n');
}
