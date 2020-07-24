/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MergeConfig, TargetLabel} from './config';
import {matchesPattern} from './string-pattern';

/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid branch is targeted.
 */
export class InvalidTargetBranchError {
  constructor(public failureMessage: string) {}
}

/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid label has been applied to a pull request.
 */
export class InvalidTargetLabelError {
  constructor(public failureMessage: string) {}
}

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

/**
 * Gets the branches from the specified target label.
 *
 * @throws {InvalidTargetLabelError} Invalid label has been applied to pull request.
 * @throws {InvalidTargetBranchError} Invalid Github target branch has been selected.
 */
export async function getBranchesFromTargetLabel(
    label: TargetLabel, githubTargetBranch: string): Promise<string[]> {
  return typeof label.branches === 'function' ? await label.branches(githubTargetBranch) :
                                                await label.branches;
}
