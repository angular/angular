/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Applies a CSS transform to an element, including browser-prefixed properties.
 * @param element
 * @param transformValue
 */
export function applyCssTransform(element: HTMLElement, transformValue: string) {
  // It's important to trim the result, because the browser will ignore the set operation
  // if the string contains only whitespace.
  let value = transformValue.trim();

  element.style.transform = value;
  element.style.webkitTransform = value;
}
