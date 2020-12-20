/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {dashCaseToCamelCase} from '../../util';

import {AnimationStyleNormalizer} from './animation_style_normalizer';

export class WebAnimationsStyleNormalizer extends AnimationStyleNormalizer {
  normalizePropertyName(propertyName: string, errors: string[]): string {
    return dashCaseToCamelCase(propertyName);
  }

  normalizeStyleValue(
      userProvidedProperty: string, normalizedProperty: string, value: string|number,
      errors: string[]): string {
    let unit: string = '';
    const strVal = value.toString().trim();

    if (DIMENSIONAL_PROP_MAP[normalizedProperty] && value !== 0 && value !== '0') {
      if (typeof value === 'number') {
        unit = 'px';
      } else {
        const valAndSuffixMatch = value.match(/^[+-]?[\d\.]+([a-z]*)$/);
        if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
          errors.push(`Please provide a CSS unit value for ${userProvidedProperty}:${value}`);
        }
      }
    }
    return strVal + unit;
  }
}

const DIMENSIONAL_PROP_MAP =
    (() => makeBooleanMap(
         'width,height,minWidth,minHeight,maxWidth,maxHeight,left,top,bottom,right,fontSize,outlineWidth,outlineOffset,paddingTop,paddingLeft,paddingBottom,paddingRight,marginTop,marginLeft,marginBottom,marginRight,borderRadius,borderWidth,borderTopWidth,borderLeftWidth,borderRightWidth,borderBottomWidth,textIndent,perspective'
             .split(',')))();

function makeBooleanMap(keys: string[]): {[key: string]: boolean} {
  const map: {[key: string]: boolean} = {};
  keys.forEach(key => map[key] = true);
  return map;
}
