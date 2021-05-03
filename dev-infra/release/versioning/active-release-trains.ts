/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

import {ReleaseTrain} from './release-trains';
import {getBranchesForMajorVersions, getVersionOfBranch, GithubRepoWithApi, VersionBranch} from './version-branches';

/** Interface describing determined active release trains for a project. */
export interface ActiveReleaseTrains {
  /** Release-train currently in the "release-candidate" or "feature-freeze" phase. */
  releaseCandidate: ReleaseTrain|null;
  /** Release-train currently in the "latest" phase. */
  latest: ReleaseTrain;
  /** Release-train in the `next` phase. */
  next: ReleaseTrain;
}

/** Branch name for the `next` branch. */
export const nextBranchName = 'master';

/** Fetches the active release trains for the configured project. */
export async function fetchActiveReleaseTrains(repo: GithubRepoWithApi):
    Promise<ActiveReleaseTrains> {
  const nextVersion = await getVersionOfBranch(repo, nextBranchName);
  const next = new ReleaseTrain(nextBranchName, nextVersion);
  const majorVersionsToConsider: number[] = [];
  let expectedReleaseCandidateMajor: number;

  // If the `next` branch (i.e. `master` branch) is for an upcoming major version, we know
  // that there is no patch branch or feature-freeze/release-candidate branch for this major
  // digit. If the current `next` version is the first minor of a major version, we know that
  // the feature-freeze/release-candidate branch can only be the actual major branch. The
  // patch branch is based on that, either the actual major branch or the last minor from the
  // preceding major version. In all other cases, the patch branch and feature-freeze or
  // release-candidate branch are part of the same major version. Consider the following:
  //
  //  CASE 1. next: 11.0.0-next.0: patch and feature-freeze/release-candidate can only be
  //          most recent `10.<>.x` branches. The FF/RC branch can only be the last-minor of v10.
  //  CASE 2. next: 11.1.0-next.0: patch can be either `11.0.x` or last-minor in v10 based
  //          on whether there is a feature-freeze/release-candidate branch (=> `11.0.x`).
  //  CASE 3. next: 10.6.0-next.0: patch can be either `10.5.x` or `10.4.x` based on whether
  //          there is a feature-freeze/release-candidate branch (=> `10.5.x`)
  if (nextVersion.minor === 0) {
    expectedReleaseCandidateMajor = nextVersion.major - 1;
    majorVersionsToConsider.push(nextVersion.major - 1);
  } else if (nextVersion.minor === 1) {
    expectedReleaseCandidateMajor = nextVersion.major;
    majorVersionsToConsider.push(nextVersion.major, nextVersion.major - 1);
  } else {
    expectedReleaseCandidateMajor = nextVersion.major;
    majorVersionsToConsider.push(nextVersion.major);
  }

  // Collect all version-branches that should be considered for the latest version-branch,
  // or the feature-freeze/release-candidate.
  const branches = (await getBranchesForMajorVersions(repo, majorVersionsToConsider));
  const {latest, releaseCandidate} = await findActiveReleaseTrainsFromVersionBranches(
      repo, nextVersion, branches, expectedReleaseCandidateMajor);

  if (latest === null) {
    throw Error(
        `Unable to determine the latest release-train. The following branches ` +
        `have been considered: [${branches.map(b => b.name).join(', ')}]`);
  }

  return {releaseCandidate, latest, next};
}

/** Finds the currently active release trains from the specified version branches. */
export async function findActiveReleaseTrainsFromVersionBranches(
    repo: GithubRepoWithApi, nextVersion: semver.SemVer, branches: VersionBranch[],
    expectedReleaseCandidateMajor: number): Promise<{
  latest: ReleaseTrain | null,
  releaseCandidate: ReleaseTrain | null,
}> {
  // Version representing the release-train currently in the next phase. Note that we ignore
  // patch and pre-release segments in order to be able to compare the next release train to
  // other release trains from version branches (which follow the `N.N.x` pattern).
  const nextReleaseTrainVersion = semver.parse(`${nextVersion.major}.${nextVersion.minor}.0`)!;

  let latest: ReleaseTrain|null = null;
  let releaseCandidate: ReleaseTrain|null = null;

  // Iterate through the captured branches and find the latest non-prerelease branch and a
  // potential release candidate branch. From the collected branches we iterate descending
  // order (most recent semantic version-branch first). The first branch is either the latest
  // active version branch (i.e. patch) or a feature-freeze/release-candidate branch. A FF/RC
  // branch cannot be older than the latest active version-branch, so we stop iterating once
  // we found such a branch. Otherwise, if we found a FF/RC branch, we continue looking for the
  // next version-branch as that one is supposed to be the latest active version-branch. If it
  // is not, then an error will be thrown due to two FF/RC branches existing at the same time.
  for (const {name, parsed} of branches) {
    // It can happen that version branches have been accidentally created which are more recent
    // than the release-train in the next branch (i.e. `master`). We could ignore such branches
    // silently, but it might be symptomatic for an outdated version in the `next` branch, or an
    // accidentally created branch by the caretaker. In either way we want to raise awareness.
    if (semver.gt(parsed, nextReleaseTrainVersion)) {
      throw Error(
          `Discovered unexpected version-branch "${name}" for a release-train that is ` +
          `more recent than the release-train currently in the "${nextBranchName}" branch. ` +
          `Please either delete the branch if created by accident, or update the outdated ` +
          `version in the next branch (${nextBranchName}).`);
    } else if (semver.eq(parsed, nextReleaseTrainVersion)) {
      throw Error(
          `Discovered unexpected version-branch "${name}" for a release-train that is already ` +
          `active in the "${nextBranchName}" branch. Please either delete the branch if ` +
          `created by accident, or update the version in the next branch (${nextBranchName}).`);
    }

    const version = await getVersionOfBranch(repo, name);
    const releaseTrain = new ReleaseTrain(name, version);
    const isPrerelease = version.prerelease[0] === 'rc' || version.prerelease[0] === 'next';

    if (isPrerelease) {
      if (releaseCandidate !== null) {
        throw Error(
            `Unable to determine latest release-train. Found two consecutive ` +
            `branches in feature-freeze/release-candidate phase. Did not expect both "${name}" ` +
            `and "${releaseCandidate.branchName}" to be in feature-freeze/release-candidate mode.`);
      } else if (version.major !== expectedReleaseCandidateMajor) {
        throw Error(
            `Discovered unexpected old feature-freeze/release-candidate branch. Expected no ` +
            `version-branch in feature-freeze/release-candidate mode for v${version.major}.`);
      }
      releaseCandidate = releaseTrain;
    } else {
      latest = releaseTrain;
      break;
    }
  }

  return {releaseCandidate, latest};
}
