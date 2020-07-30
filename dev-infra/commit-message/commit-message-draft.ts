/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {existsSync, readFileSync, unlinkSync, writeFileSync} from 'fs';

const SAVED_COMMIT_MSG_FILE_PATH = '.git/COMMIT_EDITMSG.ngDevSave';

/** Load the commit message draft from the file system if it exists. */
export function loadCommitMessageDraft() {
  if (existsSync(SAVED_COMMIT_MSG_FILE_PATH)) {
    return readFileSync(SAVED_COMMIT_MSG_FILE_PATH).toString();
  }
  return '';
}

/** Remove the commit message draft from the file system. */
export function deleteCommitMessageDraft() {
  if (existsSync(SAVED_COMMIT_MSG_FILE_PATH)) {
    unlinkSync(SAVED_COMMIT_MSG_FILE_PATH);
  }
}

/** Save the commit message draft to the file system for later retrieval. */
export function saveCommitMessageDraft(commitMessage: string) {
  writeFileSync(SAVED_COMMIT_MSG_FILE_PATH, commitMessage);
}
