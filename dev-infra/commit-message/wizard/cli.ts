/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {CommitMsgSource} from '../commit-message-source';

import {runWizard} from './wizard';


export interface WizardOptions {
  filePath: string;
  commitSha: string|undefined;
  source: CommitMsgSource|undefined;
}

/** Builds the command. */
function builder(yargs: Argv) {
  return yargs
      .positional('filePath', {
        description: 'The file path to write the generated commit message into',
        type: 'string',
        demandOption: true,
      })
      .positional('source', {
        choices: ['message', 'template', 'merge', 'squash', 'commit'] as const,
        description: 'The source of the commit message as described here: ' +
            'https://git-scm.com/docs/githooks#_prepare_commit_msg'
      })
      .positional('commitSha', {
        description: 'The commit sha if source is set to `commit`',
        type: 'string',
      });
}

/** Handles the command. */
async function handler(args: Arguments<WizardOptions>) {
  await runWizard(args);
}

/** yargs command module describing the command.  */
export const WizardModule: CommandModule<{}, WizardOptions> = {
  handler,
  builder,
  command: 'wizard <filePath> [source] [commitSha]',
  // Description: Run the wizard to build a base commit message before opening to complete.
  // No describe is defiend to hide the command from the --help.
  describe: false,
};
