/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {printTargetBranchesForPr} from './check-target-branches';

export interface CheckTargetBranchesOptions {
  pr: number;
}

/** Builds the command. */
function builder(yargs: Argv) {
  return yargs.positional('pr', {
    description: 'The pull request number',
    type: 'number',
    demandOption: true,
  });
}

/** Handles the command. */
async function handler({pr}: Arguments<CheckTargetBranchesOptions>) {
  await printTargetBranchesForPr(pr);
}

/** yargs command module describing the command.  */
export const CheckTargetBranchesModule: CommandModule<{}, CheckTargetBranchesOptions> = {
  handler,
  builder,
  command: 'check-target-branches <pr>',
  describe: 'Check a PR to determine what branches it is currently targeting',
};
