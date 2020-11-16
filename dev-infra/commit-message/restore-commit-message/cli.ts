/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {CommitMsgSource} from '../commit-message-source';

import {restoreCommitMessage} from './restore-commit-message';

export interface RestoreCommitMessageOptions {
  fileEnvVariable: string[];
}

/** Builds the command. */
function builder(yargs: Argv) {
  return yargs.option('file-env-variable' as 'fileEnvVariable', {
    type: 'string',
    array: true,
    demandOption: true,
    description: 'The key for the environment variable which holds the arguments for the\n' +
        'prepare-commit-msg hook as described here:\n' +
        'https://git-scm.com/docs/githooks#_prepare_commit_msg',
    coerce: arg => {
      const [file, source] = (process.env[arg] || '').split(' ');
      if (!file) {
        throw new Error(`Provided environment variable "${arg}" was not found.`);
      }
      return [file, source];
    },
  });
}

/** Handles the command. */
async function handler({fileEnvVariable}: Arguments<RestoreCommitMessageOptions>) {
  restoreCommitMessage(fileEnvVariable[0], fileEnvVariable[1] as CommitMsgSource);
}

/** yargs command module describing the command.  */
export const RestoreCommitMessageModule: CommandModule<{}, RestoreCommitMessageOptions> = {
  handler,
  builder,
  command: 'restore-commit-message-draft',
  // Description: Restore a commit message draft if one has been saved from a failed commit attempt.
  // No describe is defiend to hide the command from the --help.
  describe: false,
};
