/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv} from 'yargs';

import {error, red, yellow} from '../../utils/console';

import {GITHUB_TOKEN_GENERATE_URL, mergePullRequest} from './index';

/** Builds the options for the merge command. */
export function buildMergeCommand(yargs: Argv) {
  return yargs.help().strict().option('github-token', {
    type: 'string',
    description: 'Github token. If not set, token is retrieved from the environment variables.'
  })
}

/** Handles the merge command. i.e. performs the merge of a specified pull request. */
export async function handleMergeCommand(args: Arguments) {
  const githubToken = args.githubToken || process.env.GITHUB_TOKEN || process.env.TOKEN;
  if (!githubToken) {
    error(red('No Github token set. Please set the `GITHUB_TOKEN` environment variable.'));
    error(red('Alternatively, pass the `--github-token` command line flag.'));
    error(yellow(`You can generate a token here: ${GITHUB_TOKEN_GENERATE_URL}`));
    process.exit(1);
  }

  await mergePullRequest(args.prNumber, githubToken);
}
