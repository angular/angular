/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Arguments, Argv, CommandModule} from 'yargs';

import {getUserConfig} from '../../utils/config';

import {validateFile} from './validate-file';


export interface ValidateFileOptions {
  file?: string;
  fileEnvVariable?: string;
  error: boolean;
}

/** Builds the command. */
function builder(yargs: Argv) {
  return yargs
      .option('file', {
        type: 'string',
        conflicts: ['file-env-variable'],
        description: 'The path of the commit message file.',
      })
      .option('file-env-variable' as 'fileEnvVariable', {
        type: 'string',
        conflicts: ['file'],
        description: 'The key of the environment variable for the path of the commit message file.',
        coerce: (arg: string) => {
          const file = process.env[arg];
          if (!file) {
            throw new Error(`Provided environment variable "${arg}" was not found.`);
          }
          return file;
        },
      })
      .option('error', {
        type: 'boolean',
        description:
            'Whether invalid commit messages should be treated as failures rather than a warning',
        default: !!getUserConfig().commitMessage?.errorOnInvalidMessage || !!process.env['CI']
      });
}

/** Handles the command. */
async function handler({error, file, fileEnvVariable}: Arguments<ValidateFileOptions>) {
  const filePath = file || fileEnvVariable || '.git/COMMIT_EDITMSG';
  validateFile(filePath, error);
}

/** yargs command module describing the command. */
export const ValidateFileModule: CommandModule<{}, ValidateFileOptions> = {
  handler,
  builder,
  command: 'pre-commit-validate',
  describe: 'Validate the most recent commit message',
};
