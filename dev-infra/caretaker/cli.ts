/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv} from 'yargs';
import {CheckModule} from './check/cli';


/** Build the parser for the caretaker commands. */
export function buildCaretakerParser(yargs: Argv) {
  return yargs.command(CheckModule);
}
