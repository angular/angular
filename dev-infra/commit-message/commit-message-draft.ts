/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {existsSync, readFileSync, unlinkSync, writeFileSync} from 'fs';

/** Load the commit message draft from the file system if it exists. */
export function loadCommitMessageDraft(basePath: string) {
  const commitMessageDraftPath = `${basePath}.ngDevSave`;
  if (existsSync(commitMessageDraftPath)) {
    return readFileSync(commitMessageDraftPath).toString();
  }
  return '';
}

/** Remove the commit message draft from the file system. */
export function deleteCommitMessageDraft(basePath: string) {
  const commitMessageDraftPath = `${basePath}.ngDevSave`;
  if (existsSync(commitMessageDraftPath)) {
    unlinkSync(commitMessageDraftPath);
  }
}

/** Save the commit message draft to the file system for later retrieval. */
export function saveCommitMessageDraft(basePath: string, commitMessage: string) {
  writeFileSync(`${basePath}.ngDevSave`, commitMessage);
}
