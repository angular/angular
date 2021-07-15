/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {writeFileSync} from 'fs';

import {debug, log} from '../../utils/console';

import {loadCommitMessageDraft} from './commit-message-draft';
import {CommitMsgSource} from './commit-message-source';

/**
 * Restore the commit message draft to the git to be used as the default commit message.
 *
 * The source provided may be one of the sources described in
 *   https://git-scm.com/docs/githooks#_prepare_commit_msg
 */
export function restoreCommitMessage(filePath: string, source?: CommitMsgSource) {
  if (!!source) {
    if (source === 'message') {
      debug('A commit message was already provided via the command with a -m or -F flag');
    }
    if (source === 'template') {
      debug('A commit message was already provided via the -t flag or config.template setting');
    }
    if (source === 'squash') {
      debug('A commit message was already provided as a merge action or via .git/MERGE_MSG');
    }
    if (source === 'commit') {
      debug('A commit message was already provided through a revision specified via --fixup, -c,');
      debug('-C or --amend flag');
    }
    process.exit(0);
  }
  /** A draft of a commit message. */
  const commitMessage = loadCommitMessageDraft(filePath);

  // If the commit message draft has content, restore it into the provided filepath.
  if (commitMessage) {
    writeFileSync(filePath, commitMessage);
  }
  // Exit the process
  process.exit(0);
}
