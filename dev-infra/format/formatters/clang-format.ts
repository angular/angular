/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';

import {getRepoBaseDir} from '../../utils/config';
import {error} from '../../utils/console';

import {Formatter} from './base-formatter';

/**
 * Formatter for running clang-format against Typescript and Javascript files
 */
export class ClangFormat extends Formatter {
  name = 'clang-format';

  binaryFilePath = join(getRepoBaseDir(), 'node_modules/.bin/clang-format');

  defaultFileMatcher = ['**/*.{t,j}s'];

  actions = {
    check: {
      commandFlags: `--Werror -n -style=file`,
      callback:
          (_: string, code: number) => {
            return code !== 0;
          },
    },
    format: {
      commandFlags: `-i -style=file`,
      callback:
          (file: string, code: number, _: string, stderr: string) => {
            if (code !== 0) {
              error(`Error running clang-format on: ${file}`);
              error(stderr);
              error();
              return true;
            }
            return false;
          }
    }
  };
}
