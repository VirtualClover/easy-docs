import {
  AnyMetaData,
  BundleType,
  ComponentDocBlockData,
  CustomizationSettings,
  DocumentBundleMetaData,
  EMPTY_DOCUMENT_METADATA,
  EMPTY_FIGMA_FILE_BUNDLE_METADATA,
  EMPTY_FIGMA_PAGE_BUNDLE_METADATA,
  EMPTY_PAGE_METADATA,
  ExportScope,
  FigmaFileBundleMetaData,
  FigmaFileDocData,
  FigmaPageBundleMetaData,
  FigmaPageDocData,
  FigmaURLType,
  METADATA_FILENAME,
  PageBundleMetaData,
} from '../constants';
import {
  DEFAULT_SETTINGS,
  DocData,
  DocMapItem,
  ExportFileFormat,
  PageData,
  PluginSettings,
} from '../constants';
import {
  convertPropertiesToArr,
  convertSpecsObjToArr,
} from '../figma/getSpecsFromInstance';
import {
  decideEmojiBasedOnDosAndDonts,
  decideEmojiBasedOnStatus,
  mapDosAndDontsToStatus,
} from '../general/statusAssetsUtils';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../general/cleanseTextData';
import {
  generateBaseCSSDocSiteStyles,
  generateBaseCSSDocumentStyles,
  generateCSSVars,
  generateInlineStyles,
} from '../../styles/generateBaseExportStyles';
import {
  generateDisplayFrameCaptionForAnatomyFrame,
  generateHeaderContentForVariant,
  generateLayerDescription,
} from '../figma/components/componentDocComponent.figma';
import {
  generateFigmaURL,
  getDetailsFromFigmaURL,
  validateFigmaURL,
} from '../general/urlHandlers';
import {
  getPathFromMetaData,
  getPathInDocument,
  getPathInFigmaFile,
  getPathInFigmaPage,
} from './getPathToFile';

import JSZip from 'jszip';
import { addIndentation } from '../general/addIndentation';
import { baseDocSiteScript } from './baseDocSiteScript';
import { clone } from '../general/clone';
import { decidedAsciiForNodeType } from '../general/decidedAsciiForNodeType';
import { formatDirName } from './formatDirName';
import { getURLFromAnchor } from '../general/flavoredText';
import { validateFigmaNodeId } from '../general/validateFigmaNodeId';

let generateIFrameStyle = (
  borderColor: string,
  borderWidth: number,
  borderRadius: number = 8
) =>
  `border: ${borderWidth}px solid ${borderColor}; border-radius:${borderRadius}px`;

let getPathBasedOnScope = (
  scope: ExportScope = 'figmaPage',
  frameId: string,
  currentIndex: number[],
  metadata,
  bundleType: 'figmaFile' | 'figmaPage' | 'document' | 'page' = 'page'
) => {
  switch (scope) {
    case 'doc':
      return getPathInDocument(frameId, metadata).path;
      break;
    case 'figmaPage':
      return getPathInFigmaPage(frameId, metadata, currentIndex).path;
      break;
    case 'figmaFile':
      return getPathInFigmaFile(frameId, metadata, currentIndex).path;
      break;
  }
};

let generateIFrame = (
  iframeSrc: string,
  iFrameCaption: string,
  exportLink: boolean = false,
  identation: number = 0,
  style: string = generateIFrameStyle(
    DEFAULT_SETTINGS.customization.palette.status.neutral.default,
    3
  ),
  extraClass: string = '',
  classPrefix: string = DEFAULT_SETTINGS.export.classNamePrefix
) => {
  if (exportLink) {
    return `${addIndentation(identation)}${iframeSrc}${
      iFrameCaption ? `  \n${iFrameCaption}` : ``
    }  \n`;
  }
  return `${addIndentation(
    identation
  )}<figure class="${classPrefix}figma-frame ${
    extraClass ? `${classPrefix}${extraClass}` : ''
  }">\n${addIndentation(
    identation + 2
  )}<iframe style="${style}"  width="100%" height="300px" src="${iframeSrc}" allowfullscreen loading="lazy"></iframe>\n${
    iFrameCaption &&
    `${addIndentation(identation + 2)}<figcaption>\n${addIndentation(
      identation + 3
    )}${iFrameCaption}\n${addIndentation(identation + 2)}</figcaption>\n`
  }${addIndentation(identation)}</figure>`;
};

let generateMDTableRow = (
  rowData: string[],
  metadata: AnyMetaData,
  bundleType,
  currentIndex: number[]
): string => {
  let mdRow = [];
  for (let i = 0; i < rowData.length; i++) {
    const cell = convertFlavoredTextMD(
      rowData[i],
      metadata,
      bundleType,
      currentIndex
    );
    mdRow.push(`${i == 0 ? '|' : ' '}${cell}|`);
  }

  return mdRow.join('');
};

/**
 * Converts flavored text found in the JSON to markdown flavored text
 * @param text - The text to convert
 * @returns A string of markdwon flavored text
 */
let convertFlavoredTextMD = (
  text: string,
  metadata: AnyMetaData,
  bundleType: BundleType,
  currentIndex: number[]
): string => {
  let globalOffset = 0;
  let regularMatches = [
    ...text.matchAll(/(?<!<(b|i)>)<a[^>]*>([^<]+)<\/a>(?!<\/(b|i)>)/g),
  ];
  let arrRegularMatches = regularMatches.map((m) => {
    return { match: m, type: 'r' };
  });
  let boldMatches = [...text.matchAll(/<b><a[^>]*>([^<]+)<\/a><\/b>/g)];
  let arrBoldMatches = boldMatches.map((m) => {
    return { match: m, type: 'b' };
  });
  let italicMatches = [...text.matchAll(/<i><a[^>]*>([^<]+)<\/a><\/i>/g)];
  let arrItalicMatches = italicMatches.map((m) => {
    return { match: m, type: 'i' };
  });

  let matches = [...arrRegularMatches, ...arrItalicMatches, ...arrBoldMatches];
  matches.sort((a, b) => a.match.index - b.match.index);

  if (matches.length) {
    matches.forEach((item) => {
      let url = getURLFromAnchor(item.match[0], 'html');
      let isFigmaUrl = validateFigmaURL(url.href, 'share');
      let isFrameId = validateFigmaNodeId(url.href);
      if (isFigmaUrl || isFrameId) {
        let frameId;
        if (isFigmaUrl) {
          frameId = getDetailsFromFigmaURL(url.href, 'decode').frameId;
        }
        let path = getPathFromMetaData(
          metadata,
          bundleType,
          frameId ?? url.href,
          currentIndex
        );
        if (path) {
          url.href = path.path;
        }
      }

      switch (item.type) {
        case 'r':
          text =
            text.slice(0, item.match.index + globalOffset) +
            `[${item.match[2]}](${url.href})` +
            text.slice(item.match.index + globalOffset + item.match[0].length);
          globalOffset -= 11;
          break;
        case 'b':
          text =
            text.slice(0, item.match.index + globalOffset) +
            `[**${item.match[1]}**](${url.href})` +
            text.slice(item.match.index + globalOffset + item.match[0].length);
          globalOffset -= 14;
          break;
        case 'i':
          text =
            text.slice(0, item.match.index + globalOffset) +
            `[*${item.match[1]}*](${url.href})` +
            text.slice(item.match.index + globalOffset + item.match[0].length);
          globalOffset -= 16;
          break;
        default:
          break;
      }
    });
  }

  text = text.replace(/<b>(?!\s)(?!\[([^\]]*)\]\(([^)]*)\))/g, '**');
  text = text.replace(/(?<!\s)(?<!\[.*\]\(.*?\))<\/b>/g, '**');
  text = text.replace(/<i>(?!\s)(?!\[([^\]]*)\]\(([^)]*)\))/g, '*');
  text = text.replace(/(?<!\s)(?<!\[.*\]\(.*?\))<\/i>/g, '*');
  text = text.replace(/<i>(\s)/g, '*&ensp;');
  text = text.replace(/(\s)<\/i>/g, '&ensp;*');
  text = text.replace(/<b>(\s)/g, '**&ensp;');
  text = text.replace(/(\s)<\/b>/g, '&ensp;**');

  return text;
};

let convertFlavoredTextHTML = (
  text: string,
  metadata: AnyMetaData,
  bundleType: BundleType,
  currentIndex: number[]
) => {
  let getPath = (href: string) => {
    let isFigmaUrl = validateFigmaURL(href, 'share');
    let isFrameId = validateFigmaNodeId(href);
    if (isFigmaUrl || isFrameId) {
      let frameId;
      if (isFigmaUrl) {
        frameId = getDetailsFromFigmaURL(href, 'decode').frameId;
      }
      let path = getPathFromMetaData(
        metadata,
        bundleType,
        frameId ?? href,
        currentIndex
      );
      if (path) {
        href = path.path;
      }
    }

    return href;
  };

  let newText = text.replace(
    /\<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1\>/g,
    (matched, capture1, capture2, index, input) => {
      return '<a href="' + getPath(capture2) + '">';
    }
  );

  return newText;
};

let generateMDTable = (
  data,
  metadata: AnyMetaData,
  bundleType: BundleType,
  currentIndex: number[]
): string => {
  let md = [];
  let content: string[][] = data.content;
  for (let i = 0; i < content.length; i++) {
    let rowData = content[i];
    md.push(generateMDTableRow(rowData, metadata, bundleType, currentIndex));
    if (i == 0) {
      md.push('|' + '---|'.repeat(rowData.length));
    }
  }

  return md.join('\n');
};

let generateMDList = (
  data,
  metadata: AnyMetaData,
  bundleType: BundleType,
  currentIndex: number[]
): string => {
  let items = [];
  if (data.items.length) {
    for (let i = 0; i < data.items.length; i++) {
      const listItem = data.items[i];
      if (data.style == 'unordered') {
        items.push(
          `* ${convertFlavoredTextMD(
            listItem,
            metadata,
            bundleType,
            currentIndex
          )}`
        );
      } else {
        items.push(
          `${i + 1}. ${convertFlavoredTextMD(
            listItem,
            metadata,
            bundleType,
            currentIndex
          )}`
        );
      }
    }
  }

  return items.join('  \n');
};

let generateMDComponentDoc = (
  data: ComponentDocBlockData,
  settings: PluginSettings,
  displayFrameSrcType: FigmaURLType,
  metadata: AnyMetaData,
  bundleType: BundleType,
  currentIndex: number[]
): string => {
  let mdArray: string[] = [];

  if (data.variants.length && data.variants[0].displayFrame.id) {
    //Heading
    mdArray.push(`### ${data.mainComponentName}`);
    //desc
    mdArray.push(data.description);
    //Properties
    if (data.properties) {
      mdArray.push(`#### Component Properties`);
      mdArray.push(
        generateMDTable(
          {
            withHeadings: true,
            content: [
              ['Property Name', 'Type', 'Default Value', 'Options'],
              ...convertPropertiesToArr(data.properties),
            ],
          },
          metadata,
          bundleType,
          currentIndex
        ) + '  \n'
      );
    }

    //Variants
    mdArray.push(`#### Component Specs`);
    for (const variant of data.variants) {
      mdArray.push(
        `##### ${generateHeaderContentForVariant(
          variant.variantName,
          data.variants.length > 1
        )}`
      );
      let src = generateFigmaURL(
        data.fileId,
        variant.displayFrame.id,
        displayFrameSrcType
      );
      mdArray.push(
        `${generateIFrame(
          src,
          generateDisplayFrameCaptionForAnatomyFrame(
            data.mainComponentName,
            variant.variantName
          ),
          settings.export.md.linkIframes
        )}\n`
      );
      for (const [i, layer] of variant.layers.entries()) {
        mdArray.push(
          `###### ${i + 1}. ${decidedAsciiForNodeType(layer.layerType)}${
            layer.layerName
          }`
        );
        mdArray.push(`${generateLayerDescription(layer)}  \n`);
        if (layer.properties) {
          mdArray.push(
            generateMDTable(
              {
                withHeadings: true,
                content: [
                  ['Property', 'Value', 'Source'],
                  ...convertSpecsObjToArr(layer.properties),
                ],
              },
              metadata,
              bundleType,
              currentIndex
            ) + '  \n'
          );
        }
      }
      mdArray.push('\n---\n');
    }
  }
  return mdArray.join('\n');
};

/**
 * Generates markdown from Page Data
 * @param data
 * @returns
 */
export let generateMarkdownPage = async (
  data: PageData,
  settings: PluginSettings,
  metadata: AnyMetaData,
  bundleType: BundleType,
  currentIndex = [0, 0, 0]
): Promise<string> => {

  let markdown = [];
  let displayFrameSrcType: FigmaURLType = settings.export.md.linkIframes
    ? 'share'
    : 'embed';

  for (let i = 0; i < data.blocks.length; i++) {
    const block = data.blocks[i];

    switch (block.type) {
      case 'header':
        markdown.push(`${'#'.repeat(block.data.level)} ${block.data.text}`);
        break;
      case 'paragraph':
        markdown.push(
          `${convertFlavoredTextMD(
            block.data.text,
            metadata,
            bundleType,
            currentIndex
          )}`
        );
        break;
      case 'quote':
        markdown.push(
          `> ${convertFlavoredTextMD(
            block.data.text,
            metadata,
            bundleType,
            currentIndex
          )}${block.data.caption ? `  \n> ${block.data.caption}` : ``}  \n`
        );
        break;
      case 'displayFrame':
        if (block.data.fileId && block.data.frameId) {
          let src = generateFigmaURL(
            block.data.fileId,
            block.data.frameId,
            displayFrameSrcType
          );
          markdown.push(
            `${generateIFrame(
              src,
              block.data.caption,
              settings.export.md.linkIframes,
              0,
              generateIFrameStyle(
                DEFAULT_SETTINGS.customization.palette.status.neutral.default,
                3
              ),
              'display-frame'
            )}  \n`
          );
        }
        break;
      case 'dosAndDonts':
        if (block.data.fileId && block.data.frameId) {
          let src = generateFigmaURL(
            block.data.fileId,
            block.data.frameId,
            displayFrameSrcType
          );
          markdown.push(
            `${generateIFrame(
              src,
              `${decideEmojiBasedOnDosAndDonts(block.data.type)} ${
                block.data.caption
              }`,
              settings.export.md.linkIframes,
              0,
              generateIFrameStyle(
                DEFAULT_SETTINGS.customization.palette.status[
                  mapDosAndDontsToStatus(block.data.type)
                ].default,
                3
              ),
              `${block.data.type}-frame`
            )}  \n`
          );
        }
        break;
      case 'list':
        markdown.push(
          generateMDList(block.data, metadata, bundleType, currentIndex)
        );
        break;
      case 'table':
        if (block.data.content.length) {
          markdown.push(
            generateMDTable(block.data, metadata, bundleType, currentIndex)
          );
        }
        break;
      case 'alert':
        markdown.push(
          `> ${decideEmojiBasedOnStatus(block.data.type)} ${
            block.data.message
          }  \n`
        );
        break;
      case 'code':
        markdown.push(`${'```'}  \n${block.data.code}  \n${'```'}`);
        break;
      case 'divider':
        markdown.push('\n---\n');
        break;
      case 'componentDoc':
        markdown.push(
          generateMDComponentDoc(
            block.data,
            settings,
            displayFrameSrcType,
            metadata,
            bundleType,
            currentIndex
          )
        );
        break;
      default:
        break;
    }
  }

  return decodeStringForFigma(markdown.join('  \n'));
};

/**
 * Stringifies the current Page data and returns it
 * @param data - Page data
 * @returns
 */
export let generateJSONPage = async (
  data: PageData,
  settings: PluginSettings
): Promise<string> => {
  return JSON.stringify(data, null, 2);
};

let generateHTMLTableRow = (
  rowData: string[],
  isHeader: boolean = false,
  initialIndentation: number = 0,
  metadata: AnyMetaData,
  bundleType: BundleType,
  currentIndex: number[],
  classPrefix: string = DEFAULT_SETTINGS.export.classNamePrefix
): string => {
  let htmlRow = [];
  htmlRow.push(`${addIndentation(initialIndentation + 1)}<tr>`);
  if (rowData.length) {
    for (let i = 0; i < rowData.length; i++) {
      let cell = rowData[i];
      let cellTag = isHeader ? 'th' : 'td';
      htmlRow.push(
        `${addIndentation(initialIndentation + 2)}<${cellTag}${
          isHeader ? ` class="${classPrefix}table-header"` : ''
        }>${convertFlavoredTextHTML(
          cell,
          metadata,
          bundleType,
          currentIndex
        )}</${cellTag}>`
      );
    }
  }
  htmlRow.push(`${addIndentation(initialIndentation + 1)}</tr>`);
  return htmlRow.join('\n');
};

let generateHTMLTable = (
  data,
  initialIndentation: number = 0,
  metadata: AnyMetaData,
  bundleType: BundleType,
  currentIndex: number[]
) => {
  let html = [];
  let classPrefix = DEFAULT_SETTINGS.export.classNamePrefix;
  let content: string[][] = data.content;
  html.push(
    `${addIndentation(initialIndentation)}<table class="${classPrefix}table">`
  );
  if (data.content.length) {
    for (let i = 0; i < content.length; i++) {
      let rowData = content[i];
      html.push(
        generateHTMLTableRow(
          rowData,
          i == 0 && data.withHeadings,
          initialIndentation,
          metadata,
          bundleType,
          currentIndex
        )
      );
    }
  }
  html.push(`${addIndentation(initialIndentation)}</table>`);
  return html.join('\n');
};

let generateHTMLComponentDoc = (
  data: ComponentDocBlockData,
  initialIndentation: number = 0
): string => {
  let html: string[] = [];
  let classPrefix = DEFAULT_SETTINGS.export.classNamePrefix;
  if (data.variants.length && data.variants[0].displayFrame.id) {
    html.push(
      `${addIndentation(
        initialIndentation
      )}<div class="${classPrefix}component-doc">`
    );

    //Header
    html.push(
      `${addIndentation(
        initialIndentation + 1
      )}<h3 class="${classPrefix}component-doc-heading ${classPrefix}h3">${
        data.mainComponentName
      }</h3>`
    );

    //Description
    html.push(
      `${addIndentation(
        initialIndentation + 1
      )}<p class="${classPrefix}component-doc-desc ${classPrefix}p">${
        data.description
      }</p>`
    );

    //Properties
    if (data.properties) {
      html.push(
        `${addIndentation(
          initialIndentation + 1
        )}<h4 class="${classPrefix}component-doc-properties-heading ${classPrefix}h4">Component Properties</h4>`
      );
      html.push(
        `${generateHTMLTable(
          {
            withHeadings: true,
            content: [
              ['Property Name', 'Type', 'Default Value', 'Options'],
              ...convertPropertiesToArr(data.properties),
            ],
          },
          initialIndentation + 1,
          EMPTY_DOCUMENT_METADATA,
          'page',
          [0, 0, 0] // Not necessary to pass the meta data, since, in theory this table should contain hyperlinks
        )}`
      );
    }

    //Specs
    html.push(
      `${addIndentation(
        initialIndentation + 1
      )}<h4 class="${classPrefix}component-doc-properties-heading ${classPrefix}h4">Component Specs</h4>`
    );

    for (const variant of data.variants) {
      html.push(
        `${addIndentation(
          initialIndentation + 1
        )}<div class="${classPrefix}component-doc-variant-wrapper">`
      );

      html.push(
        `${addIndentation(
          initialIndentation + 2
        )}<h5 class="${classPrefix}h5">${generateHeaderContentForVariant(
          variant.variantName,
          data.variants.length > 1
        )}</h5>`
      );
      html.push(
        `${generateIFrame(
          generateFigmaURL(data.fileId, variant.displayFrame.id, 'embed'),
          generateDisplayFrameCaptionForAnatomyFrame(
            data.mainComponentName,
            variant.variantName
          ),
          false,
          initialIndentation + 2
        )}`
      );

      for (const [i, layer] of variant.layers.entries()) {
        html.push(
          `${addIndentation(
            initialIndentation + 2
          )}<div class="${classPrefix}component-doc-layer-anatomy-wrapper">`
        );

        html.push(
          `${addIndentation(
            initialIndentation + 3
          )}<h6 class="${classPrefix}h6">${i + 1}. ${decidedAsciiForNodeType(
            layer.layerType
          )}${layer.layerName}</h6>`
        );

        html.push(
          `${addIndentation(
            initialIndentation + 3
          )}<p class="${classPrefix}p">${generateLayerDescription(layer)}
        </p>`
        );

        if (layer.properties) {
          html.push(
            `${generateHTMLTable(
              {
                withHeadings: true,
                content: [
                  ['Property', 'Value', 'Source'],
                  ...convertSpecsObjToArr(layer.properties),
                ],
              },
              initialIndentation + 3,
              EMPTY_DOCUMENT_METADATA,
              'page',
              [0, 0, 0] // Not necessary to pass the meta data, since, in theory this table should contain hyperlinks
            )}`
          );
        }

        html.push(`${addIndentation(initialIndentation + 2)}</div>`);
      }

      html.push(
        `${addIndentation(
          initialIndentation + 1
        )}<div class="${classPrefix}divider"><hr /></div>`
      );

      html.push(`${addIndentation(initialIndentation + 1)}</div>`);
    }

    html.push(`${addIndentation(initialIndentation)}</div>`);
  }
  return html.join('\n');
};

let indentCodeBlock = (data: string, indentationLevel = 0): string => {
  let lines = data.split('\n');
  let formattedString = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = `${addIndentation(indentationLevel)}${line}`;
    formattedString.push(line);
  }
  return formattedString.join('\n');
};

/**
 * Generates HTML from Page Data; if the HTML body only setting is enabled it will only return the content inside <body>
 * @param data - The page data
 * @param settings - The current plugin settings
 * @param docMap - Used if the reference links settings is enabled
 * @returns
 */
export let generateHTMLPage = async (
  data: PageData,
  settings: PluginSettings,
  metadata: AnyMetaData,
  bundleType: BundleType,
  currentIndex: number[],
  initialIndentation: number = 0
): Promise<string> => {

  let html = [];
  let bodyIdentation = 0 + initialIndentation;
  let classPrefix = DEFAULT_SETTINGS.export.classNamePrefix;
  if (!settings.export.html.bodyOnly) {
    bodyIdentation = 3;
    html.push('<!DOCTYPE html>');
    html.push('<html>');
    let htmlHeadData = `${addIndentation(1)}<head>\n${addIndentation(
      2
    )}<title>${data.title}</title>\n${
      settings.export.html.addStyling
        ? generateInlineStyles(
            settings.customization,
            2,
            generateBaseCSSDocumentStyles()
          )
        : ''
    }${addIndentation(1)}</head>`;
    html.push(htmlHeadData);
    html.push(`${addIndentation(1)}<body>`);
    html.push(`${addIndentation(2)}<main class="${classPrefix}doc-body">`);
  }

  for (let i = 0; i < data.blocks.length; i++) {
    const block = data.blocks[i];

    switch (block.type) {
      case 'header':
        html.push(
          `${addIndentation(bodyIdentation)}<h${
            block.data.level
          } class="${classPrefix}h${block.data.level}">${block.data.text}</h${
            block.data.level
          }>`
        );
        break;
      case 'paragraph':
        html.push(
          `${addIndentation(
            bodyIdentation
          )}<p class="${classPrefix}p">${convertFlavoredTextHTML(
            block.data.text,
            metadata,
            bundleType,
            currentIndex
          )}</p>`
        );
        break;
      case 'quote':
        html.push(
          `${addIndentation(
            3
          )}<figure class="${classPrefix}quote">\n${addIndentation(
            4
          )}<blockquote>\n${addIndentation(
            bodyIdentation + 2
          )}${convertFlavoredTextHTML(
            block.data.text,
            metadata,
            bundleType,
            currentIndex
          )}\n${addIndentation(bodyIdentation + 3)}</blockquote>\n${
            block.data.caption &&
            `${addIndentation(
              bodyIdentation + 3
            )}<figcaption>\n${addIndentation(5)}${
              block.data.caption
            }\n${addIndentation(bodyIdentation + 3)}</figcaption>\n`
          }${addIndentation(bodyIdentation + 2)}</figure>`
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
              false,
              bodyIdentation,
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
              false,
              bodyIdentation,
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
        html.push(
          `${addIndentation(
            bodyIdentation
          )}<${tag} class="${classPrefix}${tag}">`
        );
        if (block.data.items.length) {
          for (let i = 0; i < block.data.items.length; i++) {
            const listItem = block.data.items[i];
            html.push(
              `${addIndentation(4)}<li>${convertFlavoredTextHTML(
                listItem,
                metadata,
                bundleType,
                currentIndex
              )}</li>`
            );
          }
        }
        html.push(`${addIndentation(bodyIdentation)}</${tag}>`);
        break;
      case 'table':
        html.push(
          generateHTMLTable(
            block.data,
            bodyIdentation,
            metadata,
            bundleType,
            currentIndex
          )
        );
        break;
      case 'alert':
        html.push(
          `${addIndentation(
            3
          )}<div class="${classPrefix}alert ${classPrefix}alert-${
            block.data.type
          } ${classPrefix}text-${
            block.data.align
          }"><b class="${classPrefix}alert-icon">${decideEmojiBasedOnStatus(
            block.data.type
          )} </b><span>${block.data.message}</span></div>`
        );
        break;
      case 'code':
        html.push(
          `${addIndentation(
            bodyIdentation
          )}<pre class=${classPrefix}code>\n${addIndentation(
            bodyIdentation + 1
          )}<code>\n${indentCodeBlock(
            encodeStringForHTML(block.data.code),
            bodyIdentation + 2
          )}\n${addIndentation(bodyIdentation + 1)}</code>\n${addIndentation(
            bodyIdentation
          )}</pre>`
        );
        break;
      case 'divider':
        html.push(
          `${addIndentation(
            bodyIdentation
          )}<div class="${classPrefix}divider"><hr /></div>`
        );
        break;

      case 'componentDoc':
        html.push(generateHTMLComponentDoc(block.data, bodyIdentation));
        break;
      default:
        break;
    }
  }

  if (!settings.export.html.bodyOnly) {
    html.push(`${addIndentation(2)}</main>`);
    html.push(`${addIndentation(1)}</body>`);
    html.push(`</html>`);
  }

  return html.join('  \n');
};

/**
 * Transforms Page Data into a string of formatted content
 * @param data - Page Data
 * @param format - The format
 * @param settings - The current plugin settings
 * @param docMap - Used if the reference links settings is enabled
 * @returns
 */
export let generatePageExport = async (
  data: PageData,
  format: ExportFileFormat,
  settings: PluginSettings,
  metadata: AnyMetaData,
  bundleType: BundleType,
  currentIndex: number[]
): Promise<string> => {
  let exportFunc: (
    data: PageData,
    settings: PluginSettings,
    metadata: AnyMetaData,
    bundleType: BundleType,
    currentIndex: number[],
    initialIndentation?
  ) => Promise<string>;
  let exportData = '';
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
    await exportFunc(data, settings, metadata, bundleType, currentIndex).then(
      (string) => (exportData = string)
    );
  } else {
    console.error(`The data provided didn't have any content`);
  }
  return exportData;
};

/**
 * Triggers a file download
 * @param file - The file to download
 * @param fileName - The file name
 * @param extension - The extension of the file
 */
export let downloadFile = (file: any, fileName: string, extension: string) => {
  let link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = `${fileName}`;
  link.click();
};

/**
 * Generates a documentation site and triggers a download
 * @param data
 * @param settings
 */
export let generateDocSite = async (
  data: FigmaFileDocData,
  settings: CustomizationSettings
) => {
  const zip = new JSZip();
  let siteMetadata = generateFigmaFileMetaData(data);
  let bundleName = siteMetadata.directoryName;
  zip.file('theme.css', generateCSSVars(settings));
  zip.file('nav_view.css', generateBaseCSSDocSiteStyles());
  zip.file('doc_view.css', generateBaseCSSDocumentStyles());
  zip.file('base_script.js', baseDocSiteScript);
  zip.file(`${METADATA_FILENAME}`, JSON.stringify(siteMetadata));

  for (const [fpi, figmaPage] of data.data.entries()) {
    let figmaPageDir = zip.folder(siteMetadata.directory[fpi].directoryName);

    //Generate Document dir
    for (const [di, document] of figmaPage.data.entries()) {
      let documentDir = figmaPageDir.folder(
        siteMetadata.directory[fpi].directory[di].directoryName
      );

      for (const [pi, page] of document.pages.entries()) {
        await generateDocSitePage(page, [pi, di, fpi], siteMetadata).then(
          (markup) => {
            documentDir.file(siteMetadata.directory[fpi].directory[di].directory[pi].fileName, markup);
          }
        );
      }
    }
  }

  const zipContent = await zip.generateAsync({ type: 'blob' });
  downloadFile(zipContent, bundleName, 'zip');
};

/**
 * Generates an HTML page for the doc site
 * @param pageData
 * @param currentIndex
 * @param docSiteMetadata
 * @returns
 */
export let generateDocSitePage = async (
  pageData: PageData,
  currentIndex: number[] = [0, 0, 0],
  docSiteMetadata: FigmaFileBundleMetaData
) => {
  let currentFigmaPageBundle = docSiteMetadata.directory[currentIndex[2]];
  let currentDocument = currentFigmaPageBundle.directory[currentIndex[1]];
  let markup = [];
  let settings = {
    ...DEFAULT_SETTINGS,
    export: {
      ...DEFAULT_SETTINGS.export,
      html: { bodyOnly: true, addStyling: false },
    },
  };

  markup.push(`<!DOCTYPE html>`);
  markup.push(`<html>`);
  //Head
  markup.push(`${addIndentation(1)}<head>`);
  markup.push(
    `${addIndentation(2)}<title>${docSiteMetadata.title} | ${
      currentDocument.title
    } | ${pageData.title}</title>`
  );
  markup.push(
    `${addIndentation(
      2
    )}<link rel="preconnect" href="https://fonts.googleapis.com" />`
  );
  markup.push(
    `${addIndentation(
      2
    )}<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`
  );
  markup.push(
    `${addIndentation(
      2
    )}<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>`
  );
  markup.push(
    `${addIndentation(
      2
    )}<link rel="stylesheet" href="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css"/>`
  );
  markup.push(
    `${addIndentation(2)}<link href="./../../theme.css" rel="stylesheet" />`
  );
  markup.push(
    `${addIndentation(2)}<link href="./../../nav_view.css" rel="stylesheet" />`
  );
  markup.push(
    `${addIndentation(2)}<link href="./../../doc_view.css" rel="stylesheet" />`
  );
  markup.push(`${addIndentation(1)}</head>`);
  //Body
  markup.push(`${addIndentation(1)}<body>`);
  //TopBar
  markup.push(
    `${addIndentation(
      2
    )}<header class="mdc-top-app-bar ed-top-bar" id ="app-bar">`
  );
  markup.push(`${addIndentation(3)}<div class="mdc-top-app-bar__row">`);
  markup.push(
    `${addIndentation(
      4
    )}<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">`
  );
  markup.push(
    `<button class="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button">menu</button>`
  );
  markup.push(
    `${addIndentation(5)}<span class="mdc-top-app-bar__title">${
      docSiteMetadata.title
    }</span>`
  );
  markup.push(`${addIndentation(4)}</section>`);
  markup.push(`${addIndentation(3)}</div>`);
  markup.push(`${addIndentation(2)}</header>`);
  //Dpcument content
  markup.push(`${addIndentation(2)}<div class="ed-page-content">`);
  //Side nav
  markup.push(generateDocSiteSideNav(docSiteMetadata, currentIndex, 3));
  markup.push(`${addIndentation(3)}<main class="ed-body">`);
  markup.push(
    `${addIndentation(
      4
    )}<div class="ed-doc-header"><h1 class="ed-doc-header-content">${
      currentDocument.title
    }</h1></div>`
  );

  //Tabs
  markup.push(`
${
  currentDocument.directory.length > 1
    ? generateDocSitePageTabs(currentDocument, currentIndex[0], 4)
    : ''
}
    `);

  //Content
  markup.push(`${addIndentation(4)}<div class ="ed-document-page-content">`);
  await generateHTMLPage(
    pageData,
    settings,
    docSiteMetadata,
    'figmaFile',
    currentIndex,
    5
  ).then((res) => markup.push(res));
  markup.push(`${addIndentation(4)}</div>`);
  markup.push(`${addIndentation(3)}</main>`);
  markup.push(`${addIndentation(2)}</div>`);
  markup.push(`${addIndentation(1)}</body>`);
  //Scripts
  markup.push(
    `${addIndentation(
      1
    )}<script src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"></script>`
  );
  markup.push(
    `${addIndentation(1)}<script src="./../../base_script.js"></script>`
  );
  markup.push(`</html>`);

  /*
      const tabBar = new MDCTabBar(document.querySelector('.mdc-tab-bar'));
    list.wrapFocus = true;
    const topAppBarElement = document.querySelector('.mdc-top-app-bar');
    const topAppBar = new MDCTopAppBar(topAppBarElement);
  
  
  
  */

  return markup.join('  \n');
};

/**
 * Generates an HTML makrup containing the side nav of the docsite
 * @param metadata
 * @param activeIndex
 * @param initialIdentation
 * @returns
 */
let generateDocSiteSideNav = (
  metadata: FigmaFileBundleMetaData,
  activeIndex = [0, 0],
  initialIdentation = 0
) => {
  let markup = [];

  markup.push(
    `${addIndentation(
      initialIdentation
    )}<aside class="mdc-drawer mdc-drawer--dismissible" id="nav-drawer">`
  );
  markup.push(
    `${addIndentation(initialIdentation + 1)}<div class="mdc-drawer__content">`
  );
  markup.push(
    `${addIndentation(initialIdentation + 2)}<nav class="mdc-deprecated-list">`
  );

  for (const [fpi, figmaPageBundle] of metadata.directory.entries()) {
    let doSections = metadata.directory.length > 1;
    if (doSections) {
      markup.push(
        `${addIndentation(
          initialIdentation + 3
        )}<h6 class="mdc-deprecated-list-group__subheader">${
          figmaPageBundle.title
        }</h6>`
      );
    }

    for (const [di, doc] of figmaPageBundle.directory.entries()) {
      let reference = getPathInFigmaFile(
        doc.directory[0].frameId,
        metadata,
        activeIndex
      );
      markup.push(
        `${addIndentation(
          initialIdentation + 3
        )}<a class="mdc-deprecated-list-item mdc-deprecated-list-item${
          fpi === activeIndex[2] && di === activeIndex[1] ? `--activated` : ''
        }" href=${
          reference.path
        } aria-current="page"><span class="mdc-deprecated-list-item__ripple"></span><span class="mdc-deprecated-list-item__text">${
          doc.title
        }</span></a>`
      );
    }

    if (doSections && fpi < metadata.directory.length - 1) {
      markup.push(
        `${addIndentation(
          initialIdentation + 3
        )}<hr class="mdc-deprecated-list-divider" />`
      );
    }
  }

  markup.push(`${addIndentation(initialIdentation + 2)}</nav>`);
  markup.push(`${addIndentation(initialIdentation + 1)}</div>`);
  markup.push(`${addIndentation(initialIdentation)}</aside>`);

  return markup.join('  \n');
};

/**
 * Generates the markup for tabs in a docsite page
 * @param documentMetadata
 * @param activeIndex
 * @param initialIdentation
 * @returns
 */
let generateDocSitePageTabs = (
  documentMetadata: DocumentBundleMetaData,
  activeIndex: number = 0,
  initialIdentation = 0
) => {
  let markup = [];
  markup.push(
    `${addIndentation(initialIdentation)}<div class="ed-tabs-wrapper">`
  );
  markup.push(
    `${addIndentation(
      initialIdentation + 1
    )}<div class="mdc-tab-bar" role="tablist">`
  );
  markup.push(
    `${addIndentation(initialIdentation + 2)}<div class="mdc-tab-scroller">`
  );
  markup.push(
    `${addIndentation(
      initialIdentation + 3
    )}<div class="mdc-tab-scroller__scroll-area">`
  );
  markup.push(
    `${addIndentation(
      initialIdentation + 4
    )}<div class="mdc-tab-scroller__scroll-content">`
  );

  for (const [i, page] of documentMetadata.directory.entries()) {
    let isActive = i === activeIndex;
    let reference = getPathInDocument(page.frameId, documentMetadata);
    markup.push(
      `${addIndentation(initialIdentation + 5)}<a class="mdc-tab ${
        isActive ? 'mdc-tab--active' : ''
      }" role="tab" aria-selected= ${
        isActive ? '"true"' : '"false"'
      } tabindex="0" href=${
        reference.path
      }><span class="mdc-tab__content"><span class="mdc-tab__text-label">${
        page.title
      }</span></span><span class="mdc-tab-indicator ${
        isActive ? 'mdc-tab-indicator--active' : ''
      }"><span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span></span><span class="mdc-tab__ripple"></span><div class="mdc-tab__focus-ring"></div></a>`
    );
  }
  markup.push(`${addIndentation(initialIdentation + 4)}</div>`);
  markup.push(`${addIndentation(initialIdentation + 3)}</div>`);
  markup.push(`${addIndentation(initialIdentation + 2)}</div>`);
  markup.push(`${addIndentation(initialIdentation + 1)}</div>`);
  markup.push(`${addIndentation(initialIdentation)}</div>`);

  return markup.join('  \n');
};

/**
 * Generates metadata from page data
 * @param data
 * @param currentFileNames
 * @param format
 * @returns
 */
export let generatePageMetaData = (
  data: PageData,
  currentFileNames: string[],
  format: ExportFileFormat = 'html'
): PageBundleMetaData => {
  let pageMetadata = clone(EMPTY_PAGE_METADATA);
  pageMetadata.title = data.title;
  pageMetadata.frameId = data.frameId;
  pageMetadata.fileName = `${formatDirName(
    data.title,
    currentFileNames
  )}.${format}`;
  return pageMetadata;
};

/**
 * Generates metadata from  doc data
 * @param data
 * @param currentDirNames
 * @param format
 * @returns
 */
export let generateDocumentMetadata = (
  data: DocData,
  currentDirNames: string[],
  format: ExportFileFormat = 'html'
): DocumentBundleMetaData => {
  let documentMetadata = clone(EMPTY_DOCUMENT_METADATA);
  documentMetadata.title = data.title;
  documentMetadata.sectionId = data.sectionId;
  documentMetadata.lastEdited = data.lastEdited;
  documentMetadata.directoryName = formatDirName(data.title, currentDirNames);

  let currentDocumentFileNames = [];
  for (const pageData of data.pages) {
    documentMetadata.directory.push(
      generatePageMetaData(pageData, currentDocumentFileNames, format)
    );
  }

  return documentMetadata;
};

/**
 * Generates metadata from a figma page doc data
 * @param data
 * @param currentDirNames
 * @param format
 * @param timeStamp
 * @returns
 */
export let generateFigmaPageMetadata = (
  data: FigmaPageDocData,
  currentDirNames: string[],
  format: ExportFileFormat = 'html',
  timeStamp?: string
): FigmaPageBundleMetaData => {
  let figmaPageMetadata: FigmaPageBundleMetaData = clone(
    EMPTY_FIGMA_PAGE_BUNDLE_METADATA
  );
  figmaPageMetadata.title = data.title;
  figmaPageMetadata.pageId = data.pageId;
  figmaPageMetadata.directoryName = formatDirName(data.title, currentDirNames);
  figmaPageMetadata.generatedAt = timeStamp;
  let currentFigmaPageDirNames = [];
  for (const documentData of data.data) {
    figmaPageMetadata.directory.push(
      generateDocumentMetadata(documentData, currentFigmaPageDirNames, format)
    );
  }
  return figmaPageMetadata;
};

/**
 * Generates metadata from a figma file doc data
 * @param data
 * @param format
 * @param timeStamp
 * @returns
 */
export let generateFigmaFileMetaData = (
  data: FigmaFileDocData,
  format: ExportFileFormat = 'html',
  timeStamp: string = Date.now().toString()
): FigmaFileBundleMetaData => {
  let metadata: FigmaFileBundleMetaData = clone(
    EMPTY_FIGMA_FILE_BUNDLE_METADATA
  );
  metadata.title = data.title;
  metadata.directoryName = formatDirName(data.title);
  metadata.generatedAt = timeStamp;
  let figmaFileDirNames = [];

  for (const figmaPageData of data.data) {
    metadata.directory.push(
      generateFigmaPageMetadata(
        figmaPageData,
        figmaFileDirNames,
        format,
        timeStamp
      )
    );
  }

  return metadata;
};

export let generateMetaData = (
  data,
  bundleType: BundleType = 'page',
  currentDirs = [],
  format: ExportFileFormat = 'html'
): AnyMetaData => {
  switch (bundleType) {
    case 'document':
      return generateDocumentMetadata(data, currentDirs, format);
      break;
    case 'figmaFile':
      return generateFigmaFileMetaData(data, format);
      break;
    case 'figmaPage':
      return generateFigmaPageMetadata(data, currentDirs, format);
      break;
    case 'page':
      return generatePageMetaData(data, currentDirs, format);
      break;
    default:
      return;
  }
};
