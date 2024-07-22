/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import MagicString from 'magic-string';

/** Class describing a replacement to be performed. */
export class Replacement {
  constructor(
    public pos: number,
    public end: number,
    public toInsert: string,
  ) {}
}

/** Helper that applies replacements to the given text. */
export function applyReplacements(input: string, replacements: Replacement[]): string {
  const res = new MagicString(input);
  for (const replacement of replacements) {
    res.remove(replacement.pos, replacement.end);
    res.appendLeft(replacement.pos, replacement.toInsert);
  }
  return res.toString();
}
