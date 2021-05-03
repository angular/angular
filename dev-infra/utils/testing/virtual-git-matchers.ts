/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GithubRepo} from '../git/github';

import {Commit} from './virtual-git-client';

/** Interface describing the match parameters for a virtual Git client push. */
interface BranchPushMatchParameters {
  targetRepo: GithubRepo;
  targetBranch: string;
  baseRepo: GithubRepo;
  baseBranch: string;
  expectedCommits: Commit[]|jasmine.ArrayContaining<Commit>;
}

/**
 * Gets a jasmine object matcher for asserting that a virtual Git client push
 * matches the specified branch push (through the match parameters).
 */
export function getBranchPushMatcher(options: BranchPushMatchParameters) {
  const {targetRepo, targetBranch, baseBranch, baseRepo, expectedCommits} = options;
  return jasmine.objectContaining({
    remote: {
      repoUrl: `https://abc123@github.com/${targetRepo.owner}/${targetRepo.name}.git`,
      name: `refs/heads/${targetBranch}`
    },
    head: jasmine.objectContaining({
      newCommits: expectedCommits,
      ref: {
        repoUrl: `https://abc123@github.com/${baseRepo.owner}/${baseRepo.name}.git`,
        name: baseBranch,
      },
    })
  });
}
