/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';
import {verify} from './verify';

/** Build the parser for the pullapprove commands. */
export function buildPullapproveParser(localYargs: yargs.Argv) {
  return localYargs.help()
      .strict()
      .option('verbose', {alias: ['v'], description: 'Enable verbose logging'})
      .demandCommand()
      .command('verify', 'Verify the pullapprove config', {}, ({verbose}) => verify(verbose));
}

if (require.main === module) {
  buildPullapproveParser(yargs).parse();
}
