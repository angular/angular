/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {exec as _exec, ExecOptions, ShellString} from 'shelljs';

/* Run an exec command as silent. */
export function exec(cmd: string, opts?: ExecOptions&{async?: false}): ShellString {
  return _exec(cmd, {silent: true, ...opts});
}
