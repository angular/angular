/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {invalidCssUnitValue} from '../../error_helpers';
import {dashCaseToCamelCase} from '../../util';

import {AnimationStyleNormalizer} from './animation_style_normalizer';

const DIMENSIONAL_PROP_SET = new Set([
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'left',
  'top',
  'bottom',
  'right',
  'fontSize',
  'outlineWidth',
  'outlineOffset',
  'paddingTop',
  'paddingLeft',
  'paddingBottom',
  'paddingRight',
  'marginTop',
  'marginLeft',
  'marginBottom',
  'marginRight',
  'borderRadius',
  'borderWidth',
  'borderTopWidth',
  'borderLeftWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'textIndent',
  'perspective'
]);

export class WebAnimationsStyleNormalizer extends AnimationStyleNormalizer {
  override normalizePropertyName(propertyName: string, errors: Error[]): string {
    return dashCaseToCamelCase(propertyName);
  }

  override normalizeStyleValue(
      userProvidedProperty: string, normalizedProperty: string, value: string|number,
      errors: Error[]): string {
    let unit: string = '';
    const strVal = value.toString().trim();

    if (DIMENSIONAL_PROP_SET.has(normalizedProperty) && value !== 0 && value !== '0') {
      if (typeof value === 'number') {
        unit = 'px';
      } else {
        const valAndSuffixMatch = value.match(/^[+-]?[\d\.]+([a-z]*)$/);
        if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
          errors.push(invalidCssUnitValue(userProvidedProperty, value));
        }
      }
    }
    return strVal + unit;
  }
}
