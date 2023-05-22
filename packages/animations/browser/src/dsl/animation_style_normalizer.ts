/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {forwardRef, Injectable} from '@angular/core';

import {invalidCssUnitValue} from '../error_helpers';
import {dashCaseToCamelCase} from '../util';


/**
 * @publicApi
 */
// Keep in mind that all browser test environments are init with the NoopAnimationsModule
// Effectively overwriting this providedIn:'root'. See /tools/browser_tests.init.ts
// So everytime the WebAnimationsStyleNormalizer is expected, it must me provided explicitly.
@Injectable({providedIn: 'root', useClass: forwardRef(() => NoopAnimationStyleNormalizer)})
export abstract class AnimationStyleNormalizer {
  abstract normalizePropertyName(propertyName: string, errors: Error[]): string;
  abstract normalizeStyleValue(
      userProvidedProperty: string, normalizedProperty: string, value: string|number,
      errors: Error[]): string;
}

@Injectable()
export class NoopAnimationStyleNormalizer implements AnimationStyleNormalizer {
  normalizePropertyName(propertyName: string, errors: Error[]): string {
    return propertyName;
  }

  normalizeStyleValue(
      userProvidedProperty: string, normalizedProperty: string, value: string|number,
      errors: Error[]): string {
    return <any>value;
  }
}

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

@Injectable()
export class WebAnimationsStyleNormalizer extends AnimationStyleNormalizer {
  constructor() {
    super();
  }

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
