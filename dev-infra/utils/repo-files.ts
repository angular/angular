/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getRepoBaseDir} from './config';
import {exec} from './shelljs';

/**
 * A list of all files currently in the repo which have been modified since the provided sha.
 *
 * git diff
 * Deleted files (--diff-filter=d) are not included as they are not longer present in the repo
 * and can not be checked anymore.
 *
 * git ls-files
 * Untracked files (--others), which are not matched by .gitignore (--exclude-standard)
 * as they are expected to become tracked files.
 */
export function allChangedFilesSince(sha = 'HEAD') {
  const diffFiles = gitOutputAsArray(`git diff --name-only --diff-filter=d ${sha}`);
  const untrackedFiles = gitOutputAsArray(`git ls-files --others --exclude-standard`);
  // Use a set to deduplicate the list as its possible for a file to show up in both lists.
  return Array.from(new Set([...diffFiles, ...untrackedFiles]));
}

/**
 * A list of all staged files which have been modified.
 *
 * Only added, created and modified files are listed as others (deleted, renamed, etc) aren't
 * changed or available as content to act upon.
 */
export function allStagedFiles() {
  return gitOutputAsArray(`git diff --staged --name-only --diff-filter=ACM`);
}



export function allFiles() {
  return gitOutputAsArray(`git ls-files`);
}


function gitOutputAsArray(cmd: string) {
  return exec(cmd, {cwd: getRepoBaseDir()}).split('\n').map(x => x.trim()).filter(x => !!x);
}
