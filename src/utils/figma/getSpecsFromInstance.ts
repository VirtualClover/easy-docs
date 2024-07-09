import { AnatomyProperties } from '../constants';
import { nodeSupportsChildren } from './nodeSupportsChildren';

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
  node: any,
  specsArr: { nodeName: string; properties?: AnatomyProperties }[] = [],
  treeLevel = 0
) => {
  //console.log(node.name,node.type,treeLevel);

  if (node.type != 'INSTANCE' || (node.type == 'INSTANCE' && treeLevel == 0)) {
    if (node.type != 'TEXT') {
      await generateSpecsFromNode(node).then((res) => specsArr.push(res));
    }
    if (nodeSupportsChildren(node) && node.children.length) {
      for (const childNode of node.children) {
        //console.log(childNode);
        await generateSpecs(childNode, specsArr, treeLevel + 1);
      }
    }
  }
  return specsArr;
};

export let generateSpecsFromNode = async (
  node: FrameNode | InstanceNode | ComponentNode,
  priorization = ['tokens', 'vars', 'values']
) => {
  let anatomy: AnatomyProperties = {
    width: null,
    height: null,
    fills: null,
    minHeight: node.minHeight,
    minWidth: node.minWidth,
    itemSpacing: null,
    cornerRadius: null,
    topLeftRadius: null,
    topRightRadius: null,
    bottomLeftRadius: null,
    bottomRightRadius: null,
    strokeWeight: null,
    strokeTopWeight: null,
    strokeRightWeight: null,
    strokeBottomWeight: null,
    strokeLeftWeight: null,
    strokes: null,
    paddingTop: null,
    paddingRight: null,
    paddingLeft: null,
    paddingBottom: null,
  };

  // Fill
  if (node.fills && node.fills != figma.mixed && node.fills.length) {
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
    anatomy.fills =
      baseFillValue && node.fills[0].opacity != 1
        ? `${baseFillValue}, ${node.fills[0].opacity * 100}%`
        : baseFillValue;
  }

  // Stroke
  if (node.strokes && node.strokes.length) {
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
    anatomy.strokes =
      baseStrokeColorValue && node.strokes[0].opacity != 1
        ? `${baseStrokeColorValue}, ${node.strokes[0].opacity * 100}%`
        : baseStrokeColorValue;
  }

  //Layout
  if (node.layoutMode != 'NONE') {
    anatomy.itemSpacing = node.itemSpacing;
  }

  if (node.layoutSizingHorizontal === 'FIXED') {
    anatomy.width = node.width;
  }

  if (node.layoutSizingVertical === 'FIXED') {
    anatomy.height = node.height;
  }

  //Corner radius
  if (node.cornerRadius != 0) {
    if (!isNaN(node.cornerRadius as number)) {
      anatomy.cornerRadius = node.cornerRadius as number;
    } else {
      anatomy.topLeftRadius = node.topLeftRadius;
      anatomy.topRightRadius = node.topRightRadius;
      anatomy.bottomLeftRadius = node.bottomLeftRadius;
      anatomy.bottomRightRadius = node.bottomRightRadius;
    }
  }

  // Stroke weight
  if (node.strokeWeight != 0) {
    if (!isNaN(node.strokeRightWeight as number)) {
      anatomy.strokeWeight = node.strokeWeight as number;
    } else {
      anatomy.strokeTopWeight = node.strokeTopWeight;
      anatomy.strokeRightWeight = node.strokeRightWeight;
      anatomy.strokeBottomWeight = node.strokeBottomWeight;
      anatomy.strokeLeftWeight = node.strokeLeftWeight;
    }
  }

  // Padding
  anatomy.paddingTop = node.paddingTop;
  anatomy.paddingRight = node.paddingRight;
  anatomy.paddingBottom = node.paddingBottom;
  anatomy.paddingLeft = node.paddingLeft;

  let nodeVars = node.boundVariables;
  if (nodeVars) {
    //console.log(node.boundVariables);
    for (var key in nodeVars) {
      let currentVar = nodeVars[key].length ? nodeVars[key][0] : nodeVars[key];
      await figma.variables.getVariableByIdAsync(currentVar.id).then((res) => {
        if (res) {
          anatomy[key] = res.name;
        }
      });
    }
  }
  console.log(node.getSharedPluginDataKeys('tokens'));
  let tokenKeys = node.getSharedPluginDataKeys('tokens');

  for (let i = 0; i < tokenKeys.length; i++) {
    const key = tokenKeys[i];
    console.log(key, node.getSharedPluginData('tokens', key));

    //anatomy[key] = node.getSharedPluginData('tokens', key);
  }

  /*
  let vars = figma.variables
    .getVariableByIdAsync(node.boundVariables.itemSpacing.id)
    .then((res) => console.log(res));

    */

  return { nodeName: node.name, nodeType: node.type, properties: anatomy };
};
