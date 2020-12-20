/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/** Type that describes a property name with an obtainable text. */
type PropertyNameWithText = Exclude<ts.PropertyName, ts.ComputedPropertyName>;

/**
 * Gets the text of the given property name. Returns null if the property
 * name couldn't be determined statically.
 */
export function getPropertyNameText(node: ts.PropertyName): string|null {
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) {
    return node.text;
  }
  return null;
}

/** Checks whether the given property name has a text. */
export function hasPropertyNameText(node: ts.PropertyName): node is PropertyNameWithText {
  return ts.isStringLiteral(node) || ts.isNumericLiteral(node) || ts.isIdentifier(node);
}
