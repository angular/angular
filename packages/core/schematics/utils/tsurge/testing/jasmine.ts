/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="jasmine" />

import chalk from 'chalk';
import {dedent} from './dedent';
import {diffText} from './diff';

declare global {
  namespace jasmine {
    interface Matchers<T> {
      toMatchWithDiff(expected: string): void;
    }
  }
}

export function setupTsurgeJasmineHelpers() {
  jasmine.addMatchers({
    toMatchWithDiff: () => {
      return {
        compare(actual: string, expected: string) {
          actual = dedent`${actual}`;
          expected = dedent`${expected}`;

          if (actual === expected) {
            return {pass: true};
          }

          const diffWithColors = diffText(expected, actual);
          return {
            pass: false,
            message:
              `${chalk.bold('Expected contents to match.')}\n\n` +
              `  - ${chalk.green('■■■■■■■')}: Unexpected text in your test assertion.\n` +
              `  - ${chalk.red(`■■■■■■■`)}: Text that is missing in your assertion.\n` +
              `${chalk.bold('Diff below')}:\n${diffWithColors}`,
          };
        },
      };
    },
  });
}
