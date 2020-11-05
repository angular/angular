/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {checkBurnRate} from './burn-rate';


export interface BurnRateOptions {
  ciToken: string;
  json: boolean;
}

/** Builds the command. */
function builder(yargs: Argv) {
  return yargs.option('ciToken', {type: 'string', demandOption: true}).option('json', {
    type: 'boolean',
    default: false,
  });
}

/** Handles the command. */
async function handler(args: Arguments<BurnRateOptions>) {
  await checkBurnRate(args);
}

/** yargs command module describing the command.  */
export const BurnRateModule: CommandModule<{}, BurnRateOptions> = {
  handler,
  builder,
  command: 'check-burn-rate',
  // Set describe to false to prevent the command from appearing in help menus as it is a hidden
  // command.
  describe: false,
};
