import { AnatomyProperties, PropertySource } from '../constants';

import { nodeCanHaveSpecs } from './nodeCanHaveSpecs';
import { nodeSupportsChildren } from './nodeSupportsChildren';
import { remapObjKey } from '../general/remapObjKey';

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex({ r, g, b }) {
  return (
    '#' +
    componentToHex(Math.round(r * 255)) +
    componentToHex(Math.round(g * 255)) +
    componentToHex(Math.round(b * 255))
  );
}

export let generateSpecs = async (
  node: SceneNode,
  specsArr: {
    nodeName: string;
    properties?: AnatomyProperties;
    mainComponent?: string;
  }[] = [],
  treeLevel = 0
) => {
  //console.log(node.name,node.type,treeLevel);
  if (node.type != 'INSTANCE' || (node.type == 'INSTANCE' && treeLevel == 0)) {
    await generateSpecsFromNode(node).then((res) => specsArr.push(res));
    if (nodeSupportsChildren(node) && node.children.length) {
      for (const childNode of node.children) {
        //console.log(childNode);
        await generateSpecs(childNode, specsArr, treeLevel + 1);
      }
    }
  } else {
    await node.getMainComponentAsync().then((res) => {
      if (res) {
        specsArr.push({ nodeName: node.name, mainComponent: res.name });
      }
    });
  }
  return specsArr;
};

export let generateSpecsFromNode = async (
  node: SceneNode,
  priorization: PropertySource[] = [
    'designToken',
    'figmaVariable',
    'figmaStyle',
    'raw',
  ]
) => {
  if (nodeCanHaveSpecs(node)) {
    let anatomy: AnatomyProperties = {
      width: { value: null, source: 'raw' },
      height: { value: null, source: 'raw' },
      fills: { value: null, source: 'raw' },
      minHeight: { value: node.minHeight, source: 'raw' },
      minWidth: { value: node.minWidth, source: 'raw' },
      typography: { value: null, source: 'raw' },
      itemSpacing: { value: null, source: 'raw' },
      cornerRadius: { value: null, source: 'raw' },
      topLeftRadius: { value: null, source: 'raw' },
      topRightRadius: { value: null, source: 'raw' },
      bottomLeftRadius: { value: null, source: 'raw' },
      bottomRightRadius: { value: null, source: 'raw' },
      fontName: { value: null, source: 'raw' },
      fontSize: { value: null, source: 'raw' },
      fontWeight: { value: null, source: 'raw' },
      lineHeight: { value: null, source: 'raw' },
      textDecoration: { value: null, source: 'raw' },
      letterSpacing: { value: null, source: 'raw' },
      strokeWeight: { value: null, source: 'raw' },
      strokeTopWeight: { value: null, source: 'raw' },
      strokeRightWeight: { value: null, source: 'raw' },
      strokeBottomWeight: { value: null, source: 'raw' },
      strokeLeftWeight: { value: null, source: 'raw' },
      strokes: { value: null, source: 'raw' },
      paddingTop: { value: null, source: 'raw' },
      paddingRight: { value: null, source: 'raw' },
      paddingLeft: { value: null, source: 'raw' },
      paddingBottom: { value: null, source: 'raw' },
    };

    // Fill
    if (node.fills && node.fills != figma.mixed && node.fills.length) {
      if (node.fillStyleId && node.fillStyleId != figma.mixed) {
        await figma.getStyleByIdAsync(node.fillStyleId).then((res) => {
          if (res.name) {
            anatomy.fills = { value: res.name, source: 'figmaStyle' };
          }
        });
      } else {
        let baseFillValue = null;
        switch (node.fills[0].type) {
          case 'SOLID':
            baseFillValue = rgbToHex(node.fills[0].color);
            break;
          case 'IMAGE':
            baseFillValue = '🖼 Image';
            break;
          case 'VIDEO':
            baseFillValue = '🎞 Video';
            break;
        }

        anatomy.fills.value =
          baseFillValue && node.fills[0].opacity != 1
            ? `${baseFillValue}, ${node.fills[0].opacity * 100}%`
            : baseFillValue;
      }
    }

    // Stroke
    if (node.strokes && node.strokes.length) {
      if (node.strokeStyleId) {
        await figma.getStyleByIdAsync(node.strokeStyleId).then((res) => {
          if (res.name) {
            anatomy.strokes = { value: res.name, source: 'figmaStyle' };
          }
        });
      } else {
        let baseStrokeColorValue = null;
        switch (node.strokes[0].type) {
          case 'SOLID':
            baseStrokeColorValue = rgbToHex(node.strokes[0].color);
            break;
          case 'IMAGE':
            baseStrokeColorValue = '🖼 Image';
            break;
          case 'VIDEO':
            baseStrokeColorValue = '🎞 Video';
            break;
        }

        anatomy.strokes.value =
          baseStrokeColorValue && node.strokes[0].opacity != 1
            ? `${baseStrokeColorValue}, ${node.strokes[0].opacity * 100}%`
            : baseStrokeColorValue;
      }
    }

    if (node.layoutSizingHorizontal === 'FILL') {
      anatomy.width.value = node.width;
    }

    if (node.layoutSizingVertical === 'FIXED') {
      anatomy.height.value = node.height;
    }

    if (node.type === 'TEXT') {
      console.log(node);
      if (node.textStyleId && node.textStyleId != figma.mixed) {
        await figma.getStyleByIdAsync(node.textStyleId).then((res) => {
          if (res.name) {
            anatomy.typography.value = res.name;
            anatomy.typography.source = 'figmaStyle';
          }
        });
      } else {
        generateRawTextStyleSpecs(anatomy, node);
      }
    } else {
      //Layout
      if (node.layoutMode != 'NONE') {
        anatomy.itemSpacing.value = node.itemSpacing;
      }

      //Corner radius
      if (node.cornerRadius != 0) {
        if (!isNaN(node.cornerRadius as number)) {
          anatomy.cornerRadius.value = node.cornerRadius as number;
        } else {
          anatomy.topLeftRadius.value = node.topLeftRadius;
          anatomy.topRightRadius.value = node.topRightRadius;
          anatomy.bottomLeftRadius.value = node.bottomLeftRadius;
          anatomy.bottomRightRadius.value = node.bottomRightRadius;
        }
      }

      // Stroke weight
      if (node.strokeWeight != 0) {
        if (!isNaN(node.strokeRightWeight as number)) {
          anatomy.strokeWeight.value = node.strokeWeight as number;
        } else {
          anatomy.strokeTopWeight.value = node.strokeTopWeight;
          anatomy.strokeRightWeight.value = node.strokeRightWeight;
          anatomy.strokeBottomWeight.value = node.strokeBottomWeight;
          anatomy.strokeLeftWeight.value = node.strokeLeftWeight;
        }
      }

      // Padding
      anatomy.paddingTop.value = node.paddingTop;
      anatomy.paddingRight.value = node.paddingRight;
      anatomy.paddingBottom.value = node.paddingBottom;
      anatomy.paddingLeft.value = node.paddingLeft;
    }

    let nodeVars = node.boundVariables;
    if (nodeVars) {
      console.log(node.boundVariables);
      for (var key in nodeVars) {
        let currentVar = nodeVars[key].length
          ? nodeVars[key][0]
          : nodeVars[key];
        await figma.variables
          .getVariableByIdAsync(currentVar.id)
          .then((res) => {
            if (res) {
              anatomy[key].value = res.name;
              anatomy[key].source = 'figmaVar';
            }
          });
      }
    }

    remapObjKey(anatomy, 'fills', 'fill');
    remapObjKey(anatomy, 'cornerRadius', 'borderRadius');
    let tokenKeys = node.getSharedPluginDataKeys('tokens');
    for (let i = 0; i < tokenKeys.length; i++) {
      let key: string = tokenKeys[i];
      let value: string = node
        .getSharedPluginData('tokens', key)
        .replace(/['"]+/g, '');
      console.log(key, ':', value);
      if (anatomy[key] && anatomy[key].value) {
        anatomy[key].value = value;
        anatomy[key].source = 'designToken';
      }
    }

    /*
  let vars = figma.variables
    .getVariableByIdAsync(node.boundVariables.itemSpacing.id)
    .then((res) => console.log(res));

    */

    return { nodeName: node.name, nodeType: node.type, properties: anatomy };
  }

  return null;
};

let convertUnitString = (unit: 'PIXELS' | 'PERCENT' | 'AUTO') => {
  switch (unit) {
    case 'PIXELS':
      return 'px';
    case 'PERCENT':
      return '%';
    case 'AUTO':
      return 'Auto';
  }
};

let generateRawTextStyleSpecs = (
  anatomy: AnatomyProperties,
  node: TextNode
) => {
  anatomy.fontName.value =
    node.fontName != figma.mixed
      ? `${node.fontName.family} ${node.fontName.style}`
      : null;
  anatomy.fontSize.value = node.fontSize != figma.mixed ? node.fontSize : null;
  anatomy.fontWeight.value =
    node.fontWeight != figma.mixed ? node.fontWeight : null;
  anatomy.lineHeight.value =
    node.lineHeight != figma.mixed
      ? `${
          node.lineHeight.unit != 'AUTO' ? node.lineHeight.value : ''
        }${convertUnitString(node.lineHeight.unit)}`
      : null;
  anatomy.textDecoration.value =
    node.textDecoration != figma.mixed && node.textDecoration != 'NONE'
      ? node.textDecoration
      : null;
  anatomy.letterSpacing.value =
    node.letterSpacing != figma.mixed && node.letterSpacing.value
      ? `${node.letterSpacing.value}${convertUnitString(
          node.letterSpacing.unit
        )}`
      : null;
};
