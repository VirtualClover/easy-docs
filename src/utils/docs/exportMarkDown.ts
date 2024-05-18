import {
  DEFAULT_SETTINGS,
  DocData,
  ExportFileFormat,
  PageData,
} from '../constants';

import { generateFigmaURL } from './figmaURLHandlers';

/**
 * Generates markdown from the JSON page doc object
 * @param data
 * @returns
 */
export function generateMarkdownPage(data: PageData): string {
  //console.log(data);

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
            DEFAULT_SETTINGS.palette.divider.simple
          };" src="${generateFigmaURL(
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

export function generateJSONPage(data: PageData): string {
  return JSON.stringify(data, null, 2);
}

export function generateHTMLPage(data: PageData): string {
  //console.log(data);

  let markdown = [];

  for (let i = 0; i < data.blocks.length; i++) {
    const block = data.blocks[i];

    switch (block.type) {
      case 'header':
        markdown.push(`<h${block.data.level}>${block.data.text}</h${block.data.level}>`);
        break;
      case 'paragraph':
        markdown.push(`<p>${block.data.text}</p>`);
        break;
      case 'quote':
        markdown.push(`<figure>\n <blockquote>\n  ${block.data.text}\n </blockquote>\n <figcaption>\n  ${block.data.caption}\n </figcaption>\n</figure>`);
        break;
      case 'displayFrame':
        markdown.push(
          `<iframe style="border: 1px solid ${
            DEFAULT_SETTINGS.palette.divider.simple
          };" src="${generateFigmaURL(
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

export function generatePageExport(
  data: PageData,
  format: ExportFileFormat
): string {
  let exportFunc: (data: PageData) => string;
  switch (format) {
    case 'md':
      exportFunc = generateMarkdownPage;
      break;
    case 'json':
      exportFunc = generateJSONPage;
      break;
    case 'html':
      exportFunc = generateHTMLPage;
  }

  if (data && data.blocks) {
    return exportFunc(data);
  } else {
    console.error(`The data provided didn't have any content`);
  }
}
