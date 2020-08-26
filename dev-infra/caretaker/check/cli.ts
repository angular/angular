/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {addGithubTokenFlag} from '../../utils/yargs';

import {checkServiceStatuses} from './check';


export interface CaretakerCheckOptions {
  githubToken: string;
}

/** URL to the Github page where personal access tokens can be generated. */
export const GITHUB_TOKEN_GENERATE_URL = `https://github.com/settings/tokens`;

/** Builds the command. */
function builder(yargs: Argv) {
  return addGithubTokenFlag(yargs);
}

/** Handles the command. */
async function handler({githubToken}: Arguments<CaretakerCheckOptions>) {
  await checkServiceStatuses(githubToken);
}

/** yargs command module for checking status information for the repository  */
export const CheckModule: CommandModule<{}, CaretakerCheckOptions> = {
  handler,
  builder,
  command: 'check',
  describe: 'Check the status of information the caretaker manages for the repository',
};
