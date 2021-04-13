/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import {semverInc} from '../../versioning/inc-semver';
import {ReleaseAction} from '../actions';

/**
 * Cuts the first release candidate for a release-train currently in the
 * feature-freeze phase. The version is bumped from `next` to `rc.0`.
 */
export class CutReleaseCandidateAction extends ReleaseAction {
  /** The version being released. */
  version: semver.SemVer = semverInc(this.active.releaseCandidate!.version, 'prerelease', 'rc');

  async getDescription() {
    return `Cut a first release-candidate for the feature-freeze branch (v${this.version}).`;
  }

  /** Noop, required by base class. */
  async setup() {}

  async perform() {
    const {branchName} = this.active.releaseCandidate!;

    const {id} = await this.checkoutBranchAndStageVersion(branchName);

    await this.waitForPullRequestToBeMerged(id);
    await this.buildAndPublish(branchName, 'next');
    await this.cherryPickChangelogIntoNextBranch(branchName);
  }

  static async isActive(active: ActiveReleaseTrains) {
    // A release-candidate can be cut for an active release-train currently
    // in the feature-freeze phase.
    return active.releaseCandidate !== null &&
        active.releaseCandidate.version.prerelease[0] === 'next';
  }
}
