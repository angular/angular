/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as diff from 'diff';
import chalk from 'chalk';

/**
 * Diffs the given two strings and creates a human-readable
 * colored diff string.
 */
export function diffText(expected: string, actual: string): string {
  const goldenDiff = diff.diffChars(actual, expected);
  let result = '';

  for (const part of goldenDiff) {
    // whitespace cannot be highlighted, so we use a tiny indicator character.
    const valueForColor = part.value.replace(/[ \t]/g, '·');
    // green for additions, red for deletions
    const text = part.added
      ? chalk.green(valueForColor)
      : part.removed
        ? chalk.red(valueForColor)
        : chalk.reset(part.value);

    result += text;
  }

  return result;
}
