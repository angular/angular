/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import {getLtsNpmDistTagOfMajor} from '../../versioning/long-term-support';
import {ReleaseAction} from '../actions';
import {invokeSetNpmDistCommand, invokeYarnInstallCommand} from '../external-commands';

/**
 * Release action that cuts a stable version for the current release-train in the release
 * candidate phase. The pre-release release-candidate version label is removed.
 */
export class CutStableAction extends ReleaseAction {
  private _newVersion = this._computeNewVersion();

  override async getDescription() {
    const newVersion = this._newVersion;
    return `Cut a stable release for the release-candidate branch (v${newVersion}).`;
  }

  override async perform() {
    const {branchName} = this.active.releaseCandidate!;
    const newVersion = this._newVersion;
    const isNewMajor = this.active.releaseCandidate?.isMajor;

    const {pullRequest, releaseNotes} =
        await this.checkoutBranchAndStageVersion(newVersion, branchName);

    await this.waitForPullRequestToBeMerged(pullRequest);

    // If a new major version is published, we publish to the `next` NPM dist tag temporarily.
    // We do this because for major versions, we want all main Angular projects to have their
    // new major become available at the same time. Publishing immediately to the `latest` NPM
    // dist tag could cause inconsistent versions when users install packages with `@latest`.
    // For example: Consider Angular Framework releases v12. CLI and Components would need to
    // wait for that release to complete. Once done, they can update their dependencies to point
    // to v12. Afterwards they could start the release process. In the meanwhile though, the FW
    // dependencies were already available as `@latest`, so users could end up installing v12 while
    // still having the older (but currently still latest) CLI version that is incompatible.
    // The major release can be re-tagged to `latest` through a separate release action.
    await this.buildAndPublish(releaseNotes, branchName, isNewMajor ? 'next' : 'latest');

    // If a new major version is published and becomes the "latest" release-train, we need
    // to set the LTS npm dist tag for the previous latest release-train (the current patch).
    if (isNewMajor) {
      const previousPatch = this.active.latest;
      const ltsTagForPatch = getLtsNpmDistTagOfMajor(previousPatch.version.major);

      // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
      // setting the NPM dist tag to the specified version. We do this because release NPM
      // packages could be different in the previous patch branch, and we want to set the
      // LTS tag for all packages part of the last major. It would not be possible to set the
      // NPM dist tag for new packages part of the released major, nor would it be acceptable
      // to skip the LTS tag for packages which are no longer part of the new major.
      await this.checkoutUpstreamBranch(previousPatch.branchName);
      await invokeYarnInstallCommand(this.projectDir);
      await invokeSetNpmDistCommand(ltsTagForPatch, previousPatch.version);
    }

    await this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
  }

  /** Gets the new stable version of the release candidate release-train. */
  private _computeNewVersion(): semver.SemVer {
    const {version} = this.active.releaseCandidate!;
    return semver.parse(`${version.major}.${version.minor}.${version.patch}`)!;
  }

  static override async isActive(active: ActiveReleaseTrains) {
    // A stable version can be cut for an active release-train currently in the
    // release-candidate phase. Note: It is not possible to directly release from
    // feature-freeze phase into a stable version.
    return active.releaseCandidate !== null &&
        active.releaseCandidate.version.prerelease[0] === 'rc';
  }
}
