/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The source triggering the git commit message creation.
 * As described in: https://git-scm.com/docs/githooks#_prepare_commit_msg
 */
export type CommitMsgSource = 'message'|'template'|'merge'|'squash'|'commit';
