/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {readFileSync} from 'fs';
import {resolve} from 'path';

import {getRepoBaseDir, getUserConfig} from '../utils/config';
import {error, green, info, log, red, yellow} from '../utils/console';

import {deleteCommitMessageDraft, saveCommitMessageDraft} from './commit-message-draft';
import {printValidationErrors, validateCommitMessage} from './validate';

/** Validate commit message at the provided file path. */
export function validateFile(filePath: string) {
  const commitMessage = readFileSync(resolve(getRepoBaseDir(), filePath), 'utf8');
  const {valid, errors} = validateCommitMessage(commitMessage);
  if (valid) {
    info(`${green('√')}  Valid commit message`);
    deleteCommitMessageDraft(filePath);
    process.exitCode = 0;
    return;
  }

  /**
   * Whether the validation failure should be treated as an error, otherwise treated as a warning.
   *
   * The tool running on CI is set to always run treating validation failures as an error.
   */
  const isErrorMode = !!getUserConfig().commitMessage?.errorOnInvalidMessage || !!process.env['CI'];
  /** Function used to print to the console log. */
  let printFn = isErrorMode ? error : log;

  printFn(`${isErrorMode ? red('✘') : yellow('!')}  Invalid commit message`);
  printValidationErrors(errors, printFn);
  if (isErrorMode) {
    printFn(red('Aborting commit attempt due to invalid commit message.'));
    printFn(
        red('Commit message aborted as failure rather than warning due to local configuration.'));
  } else {
    printFn(yellow('Before this commit can be merged into the upstream repository, it must be'));
    printFn(yellow('amended to follow commit message guidelines.'));
  }

  // On all invalid commit messages, the commit message should be saved as a draft to be
  // restored on the next commit attempt.
  saveCommitMessageDraft(filePath, commitMessage);
  // Set the correct exit code based on if invalid commit message is an error.
  process.exitCode = isErrorMode ? 1 : 0;
}
