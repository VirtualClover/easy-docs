import {
  BlockData,
  DEFAULT_SETTINGS,
  ExportFileFormat,
  PageData,
} from '../constants';
import {
  decideEmojiBasedOnDosAndDonts,
  mapDosAndDontsToStatus,
} from '../general/mapDosAndDontsToStatus';

import { decodeStringForFigma } from '../cleanseTextData';
import { generateFigmaURL } from '../general/urlHandlers';

// TODO Add Nextra

let addIndetation = (level) => {
  return '  '.repeat(level);
};

let generateIFrameStyle = (
  borderColor: string,
  borderWidth: number,
  borderRadius: number = 8
) =>
  `border: ${borderWidth}px solid ${borderColor}; border-radius:${borderRadius}px`;

let generateIFrame = (
  iframeSrc: string,
  iFrameCaption: string,
  identation: number = 0,
  style: string = '',
  extraClass: string = '',
  classPrefix: string = DEFAULT_SETTINGS.export.classNamePrefix
) => {
  return `${addIndetation(
    identation
  )}<figure class="${classPrefix}figma-frame ${
    extraClass ? `${classPrefix}${extraClass}` : ''
  }">\n${addIndetation(
    identation + 2
  )}<iframe style="${style}" src="${iframeSrc}" allowfullscreen></iframe>\n${
    iFrameCaption &&
    `${addIndetation(identation + 2)}<figcaption>\n${addIndetation(
      identation + 3
    )}${iFrameCaption}\n${addIndetation(identation + 2)}</figcaption>\n`
  }${addIndetation(identation)}</figure>`;
};

let generateMDTableRow = (rowData: string[]): string => {
  let mdRow = [];
  for (let i = 0; i < rowData.length; i++) {
    const cell = rowData[i];
    mdRow.push(`${i == 0 ? '|' : ' '}${cell}|`);
  }

  return mdRow.join('');
};

let generateMDTable = (data) => {
  let md = [];
  let content: string[][] = data.content;
  for (let i = 0; i < content.length; i++) {
    let rowData = content[i];
    md.push(generateMDTableRow(rowData));
    if (i == 0) {
      md.push('|' + '---|'.repeat(rowData.length));
    }
  }

  return md.join('\n');
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
        if (block.data.fileId && block.data.frameId) {
          let src = generateFigmaURL(
            block.data.fileId,
            block.data.frameId,
            'embed'
          );
          markdown.push(
            generateIFrame(
              src,
              block.data.caption,
              0,
              generateIFrameStyle(
                DEFAULT_SETTINGS.customization.palette.status.neutral.default,
                3
              ),
              'display-frame'
            )
          );
        }
        break;
      case 'dosAndDonts':
        if (block.data.fileId && block.data.frameId) {
          let src = generateFigmaURL(
            block.data.fileId,
            block.data.frameId,
            'embed'
          );
          markdown.push(
            generateIFrame(
              src,
              `${decideEmojiBasedOnDosAndDonts(block.data.type)} ${
                block.data.caption
              }`,
              0,
              generateIFrameStyle(
                DEFAULT_SETTINGS.customization.palette.status[
                  mapDosAndDontsToStatus(block.data.type)
                ].default,
                3
              ),
              `${block.data.type}-frame`
            )
          );
        }
        break;
      case 'list':
        if (block.data.items.length) {
          for (let i = 0; i < block.data.items.length; i++) {
            const listItem = block.data.items[i];
            if (block.data.style == 'unordered') {
              markdown.push(`* ${listItem}`);
            } else {
              markdown.push(`${i + 1}. ${listItem}`);
            }
          }
        }
        break;
      case 'table':
        if (block.data.content.length) {
          markdown.push(generateMDTable(block.data));
        }
        break;
      default:
        break;
    }
  }

  return decodeStringForFigma(markdown.join('  \n'));
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
        if (block.data.fileId && block.data.frameId) {
          let src = generateFigmaURL(
            block.data.fileId,
            block.data.frameId,
            'embed'
          );
          html.push(
            generateIFrame(
              src,
              block.data.caption,
              1,
              generateIFrameStyle(
                DEFAULT_SETTINGS.customization.palette.status.neutral.default,
                3
              ),
              'display-frame'
            )
          );
        }
        break;
      case 'dosAndDonts':
        if (block.data.fileId && block.data.frameId) {
          let src = generateFigmaURL(
            block.data.fileId,
            block.data.frameId,
            'embed'
          );
          html.push(
            generateIFrame(
              src,
              `${decideEmojiBasedOnDosAndDonts(block.data.type)} ${
                block.data.caption
              }`,
              1,
              generateIFrameStyle(
                DEFAULT_SETTINGS.customization.palette.status[
                  mapDosAndDontsToStatus(block.data.type)
                ].default,
                3
              ),
              `${block.data.type}-frame`
            )
          );
        }
        break;
      case 'list':
        let tag = block.data.style == 'unordered' ? 'ul' : 'ol';
        html.push(`${addIndetation(1)}<${tag} class="${classPrefix}${tag}">`);
        if (block.data.items.length) {
          for (let i = 0; i < block.data.items.length; i++) {
            const listItem = block.data.items[i];
            html.push(`${addIndetation(2)}<li>${listItem}</li>`);
          }
        }
        html.push(`${addIndetation(1)}</${tag}>`);
        break;
      default:
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
