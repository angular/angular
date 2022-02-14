/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @publicApi
 */
export abstract class AnimationStyleNormalizer {
  abstract normalizePropertyName(propertyName: string, errors: Error[]): string;
  abstract normalizeStyleValue(
      userProvidedProperty: string, normalizedProperty: string, value: string|number,
      errors: Error[]): string;
}

/**
 * @publicApi
 */
export class NoopAnimationStyleNormalizer {
  normalizePropertyName(propertyName: string, errors: Error[]): string {
    return propertyName;
  }

  normalizeStyleValue(
      userProvidedProperty: string, normalizedProperty: string, value: string|number,
      errors: Error[]): string {
    return <any>value;
  }
}
