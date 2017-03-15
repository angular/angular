/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @experimental Animation support is experimental.
 */
export abstract class AnimationStyleNormalizer {
  abstract normalizePropertyName(propertyName: string, errors: string[]): string;
  abstract normalizeStyleValue(
      userProvidedProperty: string, normalizedProperty: string, value: string|number,
      errors: string[]): string;
}

/**
 * @experimental Animation support is experimental.
 */
export class NoopAnimationStyleNormalizer {
  normalizePropertyName(propertyName: string, errors: string[]): string { return propertyName; }

  normalizeStyleValue(
      userProvidedProperty: string, normalizedProperty: string, value: string|number,
      errors: string[]): string {
    return <any>value;
  }
}
