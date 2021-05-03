/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

/** Gets the commit message for a new release point in the project. */
export function getCommitMessageForRelease(newVersion: semver.SemVer): string {
  return `release: cut the v${newVersion} release`;
}

/**
 * Gets the commit message for an exceptional version bump in the next branch. The next
 * branch version will be bumped without the release being published in some situations.
 * More details can be found in the `MoveNextIntoFeatureFreeze` release action and in:
 * https://hackmd.io/2Le8leq0S6G_R5VEVTNK9A.
 */
export function getCommitMessageForExceptionalNextVersionBump(newVersion: semver.SemVer) {
  return `release: bump the next branch to v${newVersion}`;
}

/**
 * Gets the commit message for a version update in the next branch to a major version. The next
 * branch version will be updated without the release being published if the branch is configured
 * as a major. More details can be found in the `ConfigureNextAsMajor` release action and in:
 * https://hackmd.io/2Le8leq0S6G_R5VEVTNK9A.
 */
export function getCommitMessageForNextBranchMajorSwitch(newVersion: semver.SemVer) {
  return `release: switch the next branch to v${newVersion}`;
}

/** Gets the commit message for a release notes cherry-pick commit */
export function getReleaseNoteCherryPickCommitMessage(newVersion: semver.SemVer): string {
  return `docs: release notes for the v${newVersion} release`;
}
