/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export class AnimationStyleNormalizer {}
export class NoopAnimationStyleNormalizer {
  normalizePropertyName(propertyName, errors) {
    return propertyName;
  }
  normalizeStyleValue(userProvidedProperty, normalizedProperty, value, errors) {
    return value;
  }
}
//# sourceMappingURL=animation_style_normalizer.js.map
