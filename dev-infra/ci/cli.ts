/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';

import {BurnRateModule} from './burn-rate/cli';

/** Build the parser for the ci commands. */
export function buildCiParster(localYargs: yargs.Argv) {
  return localYargs.help().strict().command(BurnRateModule);
}
