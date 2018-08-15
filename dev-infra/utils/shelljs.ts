/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {exec as _exec, ExecOptions, ShellString} from 'shelljs';

/**
 * Runs an given command as child process. By default, child process
 * output will not be printed.
 */
export function exec(cmd: string, opts?: Omit<ExecOptions, 'async'>): ShellString {
  return _exec(cmd, {silent: true, ...opts, async: false});
}
