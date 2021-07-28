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
 * Release action that moves the next release-train into the feature-freeze phase. This means
 * that a new version branch is created from the next branch, and a new next pre-release is
 * cut indicating the started feature-freeze.
 */
export class MoveNextIntoFeatureFreezeAction extends BranchOffNextBranchBaseAction {
  override newPhaseName = 'feature-freeze' as const;

  static override async isActive(active: ActiveReleaseTrains) {
    // A new feature-freeze branch can only be created if there is no active
    // release-train in feature-freeze/release-candidate phase and the version
    // currently in the `next` branch is for a major. The feature-freeze phase
    // is not foreseen for minor versions.
    return active.releaseCandidate === null && active.next.isMajor;
  }
}
