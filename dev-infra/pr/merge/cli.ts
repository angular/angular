/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs';

import {mergePullRequest} from './index';

/** The options available to the merge command via CLI. */
export interface MergeCommandOptions {
  githubToken: string;
  pr: number;
  branchPrompt: boolean;
}

/** Builds the command. */
function builder(yargs: Argv) {
  return addGithubTokenOption(yargs)
      .help()
      .strict()
      .positional('pr', {
        demandOption: true,
        type: 'number',
        description: 'The PR to be merged.',
      })
      .option('branch-prompt' as 'branchPrompt', {
        type: 'boolean',
        default: true,
        description: 'Whether to prompt to confirm the branches a PR will merge into.',
      });
}

/** Handles the command. */
async function handler({pr, branchPrompt}: Arguments<MergeCommandOptions>) {
  await mergePullRequest(pr, {branchPrompt});
}

/** yargs command module describing the command. */
export const MergeCommandModule: CommandModule<{}, MergeCommandOptions> = {
  handler,
  builder,
  command: 'merge <pr>',
  describe: 'Merge a PR into its targeted branches.',
};
