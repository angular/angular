/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs';

import {updateGithubTeamViaPrompt} from './update-github-team';


export interface CaretakerCheckOptions {
  githubToken: string;
}

/** Builds the command. */
function builder(yargs: Argv) {
  return addGithubTokenOption(yargs);
}

/** Handles the command. */
async function handler() {
  await updateGithubTeamViaPrompt();
}

/** yargs command module for checking status information for the repository  */
export const HandoffModule: CommandModule<{}, CaretakerCheckOptions> = {
  handler,
  builder,
  command: 'handoff',
  describe: 'Run a handoff assistant to aide in moving to the next caretaker',
};
