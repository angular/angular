/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {exec} from './shelljs';


/** Whether the repo has any local changes. */
export function hasLocalChanges() {
  return !!exec(`git status --porcelain`).trim();
}

/** Get the currently checked out branch. */
export function getCurrentBranch() {
  return exec(`git symbolic-ref --short HEAD`).trim();
}
