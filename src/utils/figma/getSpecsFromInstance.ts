import {
  AnatomySpecs,
  EMPTY_LAYER_PROPERTIES,
  NumberAnatomySpecs,
  SpecValueSource,
} from '../constants';

import _ from 'lodash';
import { clone } from '../general/clone';
import { nodeCanHaveSpecs } from './nodeCanHaveSpecs';
import { remapObjKey } from '../general/remapObjKey';
import { rgbToHex } from '../general/rgbToHex';

export let generateSpecsFromNode = async (
  node: SceneNode,
  avoidInstances: boolean = false,
  priorization: SpecValueSource[] = [
    'designToken',
    'figmaVariable',
    'figmaStyle',
    'rawValue',
  ]
) => {
  if (nodeCanHaveSpecs(node)) {
    let anatomy: AnatomySpecs | null = null;
    if (!avoidInstances || (avoidInstances && node.type !== 'INSTANCE')) {
      // TODO Effects
      anatomy = clone(EMPTY_LAYER_PROPERTIES);
      anatomy.minWidth.value = node.minWidth;
      anatomy.maxWidth.value = node.maxWidth;
      anatomy.maxHeight.value = node.maxHeight;

      if (node.opacity < 1) {
        anatomy.opacity.value = node.opacity;
      }

      if (node.layoutSizingHorizontal === 'FIXED') {
        anatomy.width.value = node.width;
      }

      if (node.layoutSizingVertical === 'FIXED') {
        anatomy.height.value = node.height;
      }

      if (node.type === 'TEXT') {
        //console.log(node);
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
          anatomy.topLeftRadius.value = node.topLeftRadius;
          anatomy.topRightRadius.value = node.topRightRadius;
          anatomy.bottomLeftRadius.value = node.bottomLeftRadius;
          anatomy.bottomRightRadius.value = node.bottomRightRadius;
        }

        // Stroke weight
        if (node.strokeWeight != 0) {
          if (
            node.strokeWeight != figma.mixed &&
            !isNaN(node.strokeWeight as number)
          ) {
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

      let ogValues: NumberAnatomySpecs | null = clone(anatomy);
      ogValues.typography.value = '';

      // Fill
      //console.log('node fills', node.fills);

      if (
        node.fills &&
        node.fills != figma.mixed &&
        node.fills[0] &&
        node.fills[0].visible
      ) {
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
        ogValues.fills.value = anatomy.fills.value;

        ogValues.fills.value = anatomy.fills.value;

        if (node.fillStyleId && node.fillStyleId != figma.mixed) {
          await figma.getStyleByIdAsync(node.fillStyleId).then((res) => {
            if (res.name) {
              anatomy.fills = { value: res.name, source: 'figmaStyle' };
            }
          });
        }
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

        anatomy.strokes.value =
          baseStrokeColorValue && node.strokes[0].opacity != 1
            ? `${baseStrokeColorValue}, ${node.strokes[0].opacity * 100}%`
            : baseStrokeColorValue;

        ogValues.strokes.value = anatomy.strokes.value;

        if (node.strokeStyleId) {
          await figma.getStyleByIdAsync(node.strokeStyleId).then((res) => {
            if (res.name) {
              anatomy.strokes = { value: res.name, source: 'figmaStyle' };
            }
          });
        }
      }

      let nodeVars = node.boundVariables;
      if (nodeVars) {
        for (var key in nodeVars) {
          let currentVar = nodeVars[key].length
            ? nodeVars[key][0]
            : nodeVars[key];
          await figma.variables
            .getVariableByIdAsync(currentVar.id)
            .then((res) => {
              if (res) {
                anatomy[key].value = `${res.name} ${
                  ogValues[key].value ? `(${ogValues[key].value})` : ''
                }`;
                anatomy[key].source = 'figmaVar';
              }
            });
        }
      }

      remapObjKey(anatomy, 'fills', 'fill');
      remapObjKey(anatomy, 'cornerRadius', 'borderRadius');
      remapObjKey(ogValues, 'fills', 'fill');
      remapObjKey(ogValues, 'cornerRadius', 'borderRadius');
      let tokenKeys = node.getSharedPluginDataKeys('tokens');
      for (let i = 0; i < tokenKeys.length; i++) {
        let key: string = tokenKeys[i];
        let value: string = node
          .getSharedPluginData('tokens', key)
          .replace(/['"]+/g, '');
        //console.log(key, ':', value);
        if (anatomy[key] && anatomy[key].value) {
          anatomy[key].value = `${value} ${
            ogValues[key].value ? `(${ogValues[key].value})` : ''
          }`;
          anatomy[key].source = 'designToken';
        }
      }

      if (
        ogValues.bottomLeftRadius.value +
          ogValues.bottomRightRadius.value +
          ogValues.topLeftRadius.value +
          ogValues.topRightRadius.value ==
        ogValues.topLeftRadius.value * 4
      ) {
        anatomy.borderRadius.value = anatomy.topRightRadius.value;
        anatomy.borderRadius.source = anatomy.topRightRadius.source;
        anatomy.bottomLeftRadius.value = 0;
        anatomy.topLeftRadius.value = 0;
        anatomy.topRightRadius.value = 0;
        anatomy.bottomRightRadius.value = 0;
      }

      /*
  let vars = figma.variables
    .getVariableByIdAsync(node.boundVariables.itemSpacing.id)
    .then((res) => console.log(res));

    */
    }
    return {
      nodeName: node.name,
      nodeType: node.type,
      propertiesObj: anatomy,
    };
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

let generateRawTextStyleSpecs = (anatomy: AnatomySpecs, node: TextNode) => {
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

export let convertSpecsObjToArr = (properties: AnatomySpecs) => {
  let propArr = [];
  for (const [key, value] of Object.entries(properties)) {
    if (value.value) {
      propArr.push([
        _.startCase(key),
        JSON.stringify(value.value).replace(/"/g, ''),
        _.upperFirst(_.lowerCase(value.source)),
      ]);
    }
  }
  return propArr;
};

export let convertPropertiesToArr = (
  properties: ComponentPropertyDefinitions
) => {
  let compPropArr = [];
  for (const [key, prop] of Object.entries(properties)) {
    let options = [];
    let defaultValue = prop.defaultValue.toString();

    if (prop.preferredValues) {
      options = prop.preferredValues;
    }
    if (prop.variantOptions) {
      options = prop.variantOptions;
    }
    if (prop.type == 'INSTANCE_SWAP') {
      options = ['N/A'];
      defaultValue = options[0];
    }

    if (prop.type == 'TEXT') {
      options = ['N/A'];
    }

    compPropArr.push([
      key.replace(/#[0-9]{1,}:[0-9]{1,}/, ''),
      _.startCase(_.lowerCase(prop.type)),
      defaultValue,
      prop.type == 'BOOLEAN' ? 'true, false' : options.join(', '),
    ]);
  }
  return compPropArr;
};
