/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {info} from 'console';
import {writeFileSync} from 'fs';
import {resolve} from 'path';

import {getRepoBaseDir} from '../utils/config';

import {loadCommitMessageDraft} from './commit-message-draft';

/**
 * Restore the commit message draft to the git to be used as the default commit message.
 */
export function restoreCommitMessage(filePath: string, source: string) {
  if (!!source) {
    info('Skipping commit message restoration due to flags in the `git commit` command')
  }
  /** A draft of a commit message. */
  const commitMessage = loadCommitMessageDraft();

  // If the commit message draft has content, restore it into the git's COMMIT_EDITMSG.
  if (commitMessage) {
    writeFileSync(resolve(getRepoBaseDir(), filePath), commitMessage);
  }
  // Exit the process
  process.exit(0);
}
