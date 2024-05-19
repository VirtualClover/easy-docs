import {
  BlockData,
  DEFAULT_SETTINGS,
  DocData,
  ExportFileFormat,
  PageData,
} from '../constants';

import { generateFigmaURL } from './figmaURLHandlers';

// TODO Add Nextra

let addIndetation = (level) => {
  return '  '.repeat(level);
};

let generateIFrame = (
  block: BlockData,
  identation: number = 0,
  classPrefix: string = DEFAULT_SETTINGS.export.classNamePrefix
) => {
  return `${addIndetation(
    identation
  )}<figure class="${classPrefix}figma-frame">\n${addIndetation(
    identation + 2
  )}<iframe style="border: 1px solid ${
    DEFAULT_SETTINGS.palette.divider.simple
  };" src="${generateFigmaURL(
    block.data.fileId,
    block.data.frameId,
    'embed'
  )}" allowfullscreen></iframe>\n${
    block.data.caption &&
    `${addIndetation(identation + 2)}<figcaption>\n${addIndetation(
      identation + 3
    )}${block.data.caption}\n${addIndetation(identation + 2)}</figcaption>\n`
  }${addIndetation(identation)}</figure>`;
};

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
        markdown.push(generateIFrame(block));
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

  let html = [];

  let classPrefix = DEFAULT_SETTINGS.export.classNamePrefix;

  html.push(`<main class="${classPrefix}body">`);

  for (let i = 0; i < data.blocks.length; i++) {
    const block = data.blocks[i];

    switch (block.type) {
      case 'header':
        html.push(
          `${addIndetation(1)}<h${block.data.level} class="${classPrefix}h${
            block.data.level
          }">${block.data.text}</h${block.data.level}>`
        );
        break;
      case 'paragraph':
        html.push(
          `${addIndetation(1)}<p class="${classPrefix}p">${block.data.text}</p>`
        );
        break;
      case 'quote':
        html.push(
          `${addIndetation(
            1
          )}<figure class="${classPrefix}quote">\n${addIndetation(
            2
          )}<blockquote>\n${addIndetation(3)}${
            block.data.text
          }\n${addIndetation(2)}</blockquote>\n${
            block.data.caption &&
            `${addIndetation(2)}<figcaption>\n${addIndetation(3)}${
              block.data.caption
            }\n${addIndetation(2)}</figcaption>\n`
          }${addIndetation(1)}</figure>`
        );
        break;
      case 'displayFrame':
        html.push(generateIFrame(block, 1));
        break;
    }
  }

  html.push(`</main>`);

  return html.join('  \n');
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
