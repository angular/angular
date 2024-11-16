/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as diff from 'diff';
import chalk from 'chalk';

/**
 * Diffs the given two strings and creates a human-readable
 * colored diff string.
 */
export function diffText(expected: string, actual: string, diffLineContextRange = 10): string {
  const redColorCode = chalk.red('ɵɵ').split('ɵɵ')[0];
  const greenColorCode = chalk.green('ɵɵ').split('ɵɵ')[0];
  const goldenDiff = diff.diffChars(actual, expected);
  let fullResult = '';

  for (const part of goldenDiff) {
    // whitespace cannot be highlighted, so we use a tiny indicator character.
    const valueForColor = part.value.replace(/[ \t]/g, '·');
    // green for additions, red for deletions
    const text = part.added
      ? chalk.green(valueForColor)
      : part.removed
        ? chalk.red(valueForColor)
        : chalk.reset(part.value);

    fullResult += text;
  }

  const lines = fullResult.split(/\n/g);
  const linesToRender = new Set<number>();

  // Find lines with diff, and include context lines around them.
  for (const [index, l] of lines.entries()) {
    if (l.includes(redColorCode) || l.includes(greenColorCode)) {
      const contextBottom = index - diffLineContextRange;
      const contextTop = index + diffLineContextRange;

      numbersFromTo(Math.max(0, contextBottom), index).forEach((lineNum) =>
        linesToRender.add(lineNum),
      );
      numbersFromTo(index, Math.min(contextTop, lines.length - 1)).forEach((lineNum) =>
        linesToRender.add(lineNum),
      );
    }
  }

  let result = '';
  let previous = -1;

  // Compute full diff text. Add markers if lines were skipped.
  for (const lineIndex of Array.from(linesToRender).sort((a, b) => a - b)) {
    if (lineIndex - 1 !== previous) {
      result += `${chalk.grey('... (lines above) ...')}\n`;
    }
    result += `${lines[lineIndex]}\n`;
    previous = lineIndex;
  }

  if (previous < lines.length - 1) {
    result += `${chalk.grey('... (lines below) ...\n')}`;
  }

  return result;
}

function numbersFromTo(start: number, end: number): number[] {
  const list: number[] = [];
  for (let i = start; i <= end; i++) {
    list.push(i);
  }
  return list;
}
