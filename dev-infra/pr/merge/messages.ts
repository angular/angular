/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {red} from '../../utils/console';

import {PullRequest} from './pull-request';

export function getCaretakerNotePromptMessage(pullRequest: PullRequest): string {
  return red('Pull request has a caretaker note applied. Please make sure you read it.') +
      `\nQuick link to PR: ${pullRequest.url}\nDo you want to proceed merging?`;
}

export function getTargettedBranchesConfirmationPromptMessage(pullRequest: PullRequest): string {
  const targetBranchListAsString = pullRequest.targetBranches.map(b => ` - ${b}\n`).join('');
  return `Pull request #${pullRequest.prNumber} will merge into:\n${
      targetBranchListAsString}\nDo you want to proceed merging?`;
}
