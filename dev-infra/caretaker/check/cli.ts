/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {error} from '../../utils/console';

import {checkServiceStatuses} from './check';


export interface CaretakerCheckOptions {
  'github-token'?: string;
}

/** URL to the Github page where personal access tokens can be generated. */
export const GITHUB_TOKEN_GENERATE_URL = `https://github.com/settings/tokens`;

/** Builds the command. */
function builder(yargs: Argv) {
  return yargs.option('github-token', {
    type: 'string',
    description: 'Github token. If not set, token is retrieved from the environment variables.'
  });
}

/** Handles the command. */
async function handler({'github-token': token}: Arguments<CaretakerCheckOptions>) {
  const githubToken = token || process.env.GITHUB_TOKEN || process.env.TOKEN;
  if (!githubToken) {
    error('No Github token set. Please set the `GITHUB_TOKEN` environment variable.');
    error('Alternatively, pass the `--github-token` command line flag.');
    error(`You can generate a token here: ${GITHUB_TOKEN_GENERATE_URL}`);
    process.exitCode = 1;
    return;
  }
  await checkServiceStatuses(githubToken);
}

/** yargs command module for checking status information for the repository  */
export const CheckModule: CommandModule<{}, CaretakerCheckOptions> = {
  handler,
  builder,
  command: 'check',
  describe: 'Check the status of information the caretaker manages for the repository',
};
