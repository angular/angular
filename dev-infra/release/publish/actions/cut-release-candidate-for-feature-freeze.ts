/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {semverInc} from '../../../utils/semver';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import {ReleaseAction} from '../actions';

/**
 * Cuts the first release candidate for a release-train currently in the
 * feature-freeze phase. The version is bumped from `next` to `rc.0`.
 */
export class CutReleaseCandidateForFeatureFreezeAction extends ReleaseAction {
  private _newVersion = semverInc(this.active.releaseCandidate!.version, 'prerelease', 'rc');

  override async getDescription() {
    const newVersion = this._newVersion;
    return `Cut a first release-candidate for the feature-freeze branch (v${newVersion}).`;
  }

  override async perform() {
    const {branchName} = this.active.releaseCandidate!;
    const newVersion = this._newVersion;

    const {pullRequest, releaseNotes} =
        await this.checkoutBranchAndStageVersion(newVersion, branchName);

    await this.waitForPullRequestToBeMerged(pullRequest);
    await this.buildAndPublish(releaseNotes, branchName, 'next');
    await this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
  }

  static override async isActive(active: ActiveReleaseTrains) {
    // A release-candidate can be cut for an active release-train currently
    // in the feature-freeze phase.
    return active.releaseCandidate !== null &&
        active.releaseCandidate.version.prerelease[0] === 'next';
  }
}
