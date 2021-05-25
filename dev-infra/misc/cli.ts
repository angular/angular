/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';

import {BuildAndLinkCommandModule} from './build-and-link/cli';

/** Build the parser for the misc commands. */
export function buildMiscParser(localYargs: yargs.Argv) {
  return localYargs.help().strict().command(BuildAndLinkCommandModule);
}
