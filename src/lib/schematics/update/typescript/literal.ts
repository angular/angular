/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/** Returns the text of a string literal without the quotes. */
export function getLiteralTextWithoutQuotes(literal: ts.StringLiteral) {
  return literal.getText().substring(1, literal.getText().length - 1);
}

/** Method that can be used to replace all search occurrences in a string. */
export function findAll(str: string, search: string): number[] {
  const result: number[] = [];
  let i = -1;
  while ((i = str.indexOf(search, i + 1)) !== -1) {
    result.push(i);
  }
  return result;
}
