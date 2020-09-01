/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fetch from 'node-fetch';
import * as semver from 'semver';

import {promptConfirm, red, warn, yellow} from '../../../utils/console';
import {InvalidTargetBranchError} from '../target-label';

import {getVersionOfBranch, GithubRepo} from './branches';

/**
 * Number of months a major version in Angular is actively supported. See:
 * https://angular.io/guide/releases#support-policy-and-schedule.
 */
const majorActiveSupportDuration = 6;

/**
 * Number of months a major version has active long-term support. See:
 * https://angular.io/guide/releases#support-policy-and-schedule.
 */
const majorActiveTermSupportDuration = 12;

/**
 * Asserts that the given branch corresponds to an active LTS version-branch that can receive
 * backport fixes. Throws an error if LTS expired or an invalid branch is selected.
 *
 * @param repo Github repository for which the given branch exists.
 * @param representativeNpmPackage NPM package representing the given repository. Angular
 *   repositories usually contain multiple packages in a monorepo scheme, but packages commonly
 *   are released with the same versions. This means that a single package can be used for querying
 *   NPM about previously published versions (e.g. to determine active LTS versions). The package
 *   name is used to check if the given branch is containing an active LTS version.
 * @param branchName Branch that is checked to be an active LTS version-branch.
 * */
export async function assertActiveLtsBranch(
    repo: GithubRepo, representativeNpmPackage: string, branchName: string) {
  const version = await getVersionOfBranch(repo, branchName);
  const {'dist-tags': distTags, time} =
      await (await fetch(`https://registry.npmjs.org/${representativeNpmPackage}`)).json();

  // LTS versions should be tagged in NPM in the following format: `v{major}-lts`.
  const ltsVersion = semver.parse(distTags[`v${version.major}-lts`]);

  // Ensure that there is a LTS version tagged for the given version-branch major. e.g.
  // if the version branch is `9.2.x` then we want to make sure that there is a LTS
  // version tagged in NPM for `v9`, following the `v{major}-lts` tag convention.
  if (ltsVersion === null) {
    throw new InvalidTargetBranchError(`No LTS version tagged for v${version.major} in NPM.`);
  }

  // Ensure that the correct branch is used for the LTS version. We do not want to merge
  // changes to older minor version branches that do not reflect the current LTS version.
  if (branchName !== `${ltsVersion.major}.${ltsVersion.minor}.x`) {
    throw new InvalidTargetBranchError(
        `Not using last-minor branch for v${version.major} LTS version. PR ` +
        `should be updated to target: ${ltsVersion.major}.${ltsVersion.minor}.x`);
  }

  const today = new Date();
  const releaseDate = new Date(time[`${version.major}.0.0`]);
  const ltsEndDate = new Date(
      releaseDate.getFullYear(),
      releaseDate.getMonth() + majorActiveSupportDuration + majorActiveTermSupportDuration,
      releaseDate.getDate(), releaseDate.getHours(), releaseDate.getMinutes(),
      releaseDate.getSeconds(), releaseDate.getMilliseconds());

  // Check if LTS has already expired for the targeted major version. If so, we do not
  // allow the merge as per our LTS guarantees. Can be forcibly overridden if desired.
  // See: https://angular.io/guide/releases#support-policy-and-schedule.
  if (today > ltsEndDate) {
    const ltsEndDateText = ltsEndDate.toLocaleDateString();
    warn(red(`Long-term support ended for v${version.major} on ${ltsEndDateText}.`));
    warn(yellow(
        `Merging of pull requests for this major is generally not ` +
        `desired, but can be forcibly ignored.`));
    if (await promptConfirm('Do you want to forcibly proceed with merging?')) {
      return;
    }
    throw new InvalidTargetBranchError(
        `Long-term supported ended for v${version.major} on ${ltsEndDateText}. ` +
        `Pull request cannot be merged into the ${branchName} branch.`);
  }
}
