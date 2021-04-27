/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import {exec} from 'shelljs';

import {error} from '../../utils/console';

import {Formatter} from './base-formatter';

/**
 * Formatter for running prettier against Typescript and Javascript files.
 */
export class Prettier extends Formatter {
  name = 'prettier';

  binaryFilePath = join(this.git.baseDir, 'node_modules/.bin/prettier');

  defaultFileMatcher = ['**/*.{t,j}s'];

  /**
   * The configuration path of the pretter config, obtained during construction to prevent needing
   * to discover it repeatedly for each execution.
   */
  private configPath =
      this.config['pretter'] ? exec(`${this.binaryFilePath} --find-config-path .`).trim() : '';

  actions = {
    check: {
      commandFlags: `--config ${this.configPath} --check`,
      callback:
          (_: string, code: number, stdout: string) => {
            return code !== 0;
          },
    },
    format: {
      commandFlags: `--config ${this.configPath} --write`,
      callback:
          (file: string, code: number, _: string, stderr: string) => {
            if (code !== 0) {
              error(`Error running prettier on: ${file}`);
              error(stderr);
              error();
              return true;
            }
            return false;
          },
    },
  };
}
