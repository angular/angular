/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {checkTargetBranchesForPr} from './check-target-branches';

export interface CheckTargetBranchesOptions {
  pr: number;
  json: boolean;
}

/** Builds the command. */
function builder(yargs: Argv) {
  return yargs
      .positional('pr', {
        description: 'The pull request number',
        type: 'number',
        demandOption: true,
      })
      .option('json', {
        type: 'boolean',
        default: false,
        description: 'Print response as json',
      });
}

/** Handles the command. */
async function handler({pr, json}: Arguments<CheckTargetBranchesOptions>) {
  await checkTargetBranchesForPr(pr, json);
}

/** yargs command module describing the command.  */
export const CheckTargetBranchesModule: CommandModule<{}, CheckTargetBranchesOptions> = {
  handler,
  builder,
  command: 'check-target-branches <pr>',
  describe: 'Check a PR to determine what branches it is currently targeting',
};
