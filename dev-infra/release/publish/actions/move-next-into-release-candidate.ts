/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ActiveReleaseTrains} from '../../versioning';

import {BranchOffNextBranchBaseAction} from './branch-off-next-branch';

/**
 * Release action that moves the next release-train into the release-candidate phase. This means
 * that a new version branch is created from the next branch, and the first release candidate
 * version is cut indicating the new phase.
 */
export class MoveNextIntoReleaseCandidateAction extends BranchOffNextBranchBaseAction {
  override newPhaseName = 'release-candidate' as const;

  static override async isActive(active: ActiveReleaseTrains) {
    // Directly switching a next release-train into the `release-candidate`
    // phase is only allowed for minor releases. Major version always need to
    // go through the `feature-freeze` phase.
    return active.releaseCandidate === null && !active.next.isMajor;
  }
}
