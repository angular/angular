/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {CommitMsgSource} from './commit-message-source';

import {restoreCommitMessage} from './restore-commit-message';

export interface RestoreCommitMessageOptions {
  file?: string;
  source?: string;
  fileEnvVariable?: string;
}

/** Builds the command. */
function builder(yargs: Argv) {
  return yargs
      .option('file-env-variable' as 'fileEnvVariable', {
        type: 'string',
        description: 'The key for the environment variable which holds the arguments for the\n' +
            'prepare-commit-msg hook as described here:\n' +
            'https://git-scm.com/docs/githooks#_prepare_commit_msg'
      })
      .positional('file', {type: 'string'})
      .positional('source', {type: 'string'});
}

/** Handles the command. */
async function handler({fileEnvVariable, file, source}: Arguments<RestoreCommitMessageOptions>) {
  // File and source are provided as command line parameters
  if (file !== undefined) {
    restoreCommitMessage(file, source as CommitMsgSource);
    return;
  }

  // File and source are provided as values held in an environment variable.
  if (fileEnvVariable !== undefined) {
    const [fileFromEnv, sourceFromEnv] = (process.env[fileEnvVariable!] || '').split(' ');
    if (!fileFromEnv) {
      throw new Error(`Provided environment variable "${fileEnvVariable}" was not found.`);
    }
    restoreCommitMessage(fileFromEnv, sourceFromEnv as CommitMsgSource);
    return;
  }

  throw new Error(
      'No file path and commit message source provide. Provide values via positional command ' +
      'arguments, or via the --file-env-variable flag');
}

/** yargs command module describing the command. */
export const RestoreCommitMessageModule: CommandModule<{}, RestoreCommitMessageOptions> = {
  handler,
  builder,
  command: 'restore-commit-message-draft [file] [source]',
  // Description: Restore a commit message draft if one has been saved from a failed commit attempt.
  // No describe is defiend to hide the command from the --help.
  describe: false,
};
