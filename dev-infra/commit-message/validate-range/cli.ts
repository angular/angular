/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {info} from '../../utils/console';

import {validateCommitRange} from './validate-range';


export interface ValidateRangeOptions {
  startingRef: string;
  endingRef: string;
}

/** Builds the command. */
function builder(yargs: Argv) {
  return yargs
      .positional('startingRef', {
        description: 'The first ref in the range to select',
        type: 'string',
        demandOption: true,
      })
      .positional('endingRef', {
        description: 'The last ref in the range to select',
        type: 'string',
        default: 'HEAD',
      });
}

/** Handles the command. */
async function handler({startingRef, endingRef}: Arguments<ValidateRangeOptions>) {
  // If on CI, and no pull request number is provided, assume the branch
  // being run on is an upstream branch.
  if (process.env['CI'] && process.env['CI_PULL_REQUEST'] === 'false') {
    info(`Since valid commit messages are enforced by PR linting on CI, we do not`);
    info(`need to validate commit messages on CI runs on upstream branches.`);
    info();
    info(`Skipping check of provided commit range`);
    return;
  }
  await validateCommitRange(startingRef, endingRef);
}

/** yargs command module describing the command. */
export const ValidateRangeModule: CommandModule<{}, ValidateRangeOptions> = {
  handler,
  builder,
  command: 'validate-range <starting-ref> [ending-ref]',
  describe: 'Validate a range of commit messages',
};
