/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs';

import {updateCaretakerTeamViaPrompt} from './update-github-team';


export interface CaretakerHandoffOptions {
  githubToken: string;
}

/** Builds the command. */
function builder(yargs: Argv) {
  return addGithubTokenOption(yargs);
}

/** Handles the command. */
async function handler() {
  await updateCaretakerTeamViaPrompt();
}

/** yargs command module for assisting in handing off caretaker.  */
export const HandoffModule: CommandModule<{}, CaretakerHandoffOptions> = {
  handler,
  builder,
  command: 'handoff',
  describe: 'Run a handoff assistant to aide in moving to the next caretaker',
};
