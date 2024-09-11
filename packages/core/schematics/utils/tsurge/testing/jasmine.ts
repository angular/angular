/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="jasmine" />

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
            message: `Expected contents to match. Diff below.\n${diffWithColors}`,
          };
        },
      };
    },
  });
}
