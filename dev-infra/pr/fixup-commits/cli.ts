/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {error} from '../../utils/console';

import {fixupCommits} from './fixup-commits';

/** The options available to the fixup-commits command via CLI. */
export interface FixupCommitsOptions {
  'github-token'?: string;
  prNumber: number;
}

/** URL to the Github page where personal access tokens can be generated. */
export const GITHUB_TOKEN_GENERATE_URL = `https://github.com/settings/tokens`;

/** Builds the fixup-commits pull request command. */
function builder(yargs: Argv) {
  return yargs
      .option('github-token', {
        type: 'string',
        description: 'Github token. If not set, token is retrieved from the environment variables.'
      })
      .positional('prNumber', {type: 'number', demandOption: true});
}

/** Handles the fixup-commits pull request command. */
async function handler({prNumber, 'github-token': token}: Arguments<FixupCommitsOptions>) {
  const githubToken = token || process.env.GITHUB_TOKEN || process.env.TOKEN;
  if (!githubToken) {
    error('No Github token set. Please set the `GITHUB_TOKEN` environment variable.');
    error('Alternatively, pass the `--github-token` command line flag.');
    error(`You can generate a token here: ${GITHUB_TOKEN_GENERATE_URL}`);
    process.exit(1);
  }

  try {
    await fixupCommits(prNumber, githubToken);
  } catch (e) {
    error(e);
    process.exitCode = 1;
  }
}

export const FixupCommitsCommandModule: CommandModule<{}, FixupCommitsOptions> = {
  handler,
  builder,
  command: 'fixup-commits <pr-number>',
  describe: 'Amend commits for a PR and push back to the upstream repository'
};
