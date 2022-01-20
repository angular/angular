/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export const SVG_NAMESPACE = 'svg';
export const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
export const MATH_ML_NAMESPACE = 'math';
export const MATH_ML_NAMESPACE_URI = 'http://www.w3.org/1998/MathML/';

export function getNamespaceUri(namespace: string): string|null {
  const name = namespace.toLowerCase();
  return name === SVG_NAMESPACE ? SVG_NAMESPACE_URI :
                                  (name === MATH_ML_NAMESPACE ? MATH_ML_NAMESPACE_URI : null);
}
