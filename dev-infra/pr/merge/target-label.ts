/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MergeConfig, TargetLabel} from './config';
import {matchesPattern} from './string-pattern';

/** Gets the target label from the specified pull request labels. */
export function getTargetLabelFromPullRequest(config: MergeConfig, labels: string[]): TargetLabel|
    null {
  for (const label of labels) {
    const match = config.labels.find(({pattern}) => matchesPattern(label, pattern));
    if (match !== undefined) {
      return match;
    }
  }
  return null;
}

/** Gets the branches from the specified target label. */
export function getBranchesFromTargetLabel(
    label: TargetLabel, githubTargetBranch: string): string[] {
  return typeof label.branches === 'function' ? label.branches(githubTargetBranch) : label.branches;
}
