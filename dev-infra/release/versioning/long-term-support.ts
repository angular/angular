/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

import {ReleaseConfig} from '../config/index';

import {fetchProjectNpmPackageInfo} from './npm-registry';

/** Type describing a NPM dist tag indicating long-term support. */
export type LtsNpmDistTag = `v${number}-lts`;

/** Interface describing determined LTS branches. */
export interface LtsBranches {
  /** List of active LTS version branches. */
  active: LtsBranch[];
  /** List of inactive LTS version branches. */
  inactive: LtsBranch[];
}

/** Interface describing an LTS version branch. */
export interface LtsBranch {
  /** Name of the branch. */
  name: string;
  /** Most recent version for the given LTS branch. */
  version: semver.SemVer;
  /** NPM dist tag for the LTS version. */
  npmDistTag: LtsNpmDistTag;
}

/**
 * Number of months a major version in Angular is actively supported. See:
 * https://angular.io/guide/releases#support-policy-and-schedule.
 */
const majorActiveSupportDuration = 6;

/**
 * Number of months a major version has active long-term support. See:
 * https://angular.io/guide/releases#support-policy-and-schedule.
 */
const majorLongTermSupportDuration = 12;

/** Regular expression that matches LTS NPM dist tags. */
const ltsNpmDistTagRegex = /^v(\d+)-lts$/;

/** Finds all long-term support release trains from the specified NPM package. */
export async function fetchLongTermSupportBranchesFromNpm(config: ReleaseConfig):
    Promise<LtsBranches> {
  const {'dist-tags': distTags, time} = await fetchProjectNpmPackageInfo(config);
  const today = new Date();
  const active: LtsBranch[] = [];
  const inactive: LtsBranch[] = [];

  // Iterate through the NPM package information and determine active/inactive LTS versions with
  // their corresponding branches. We assume that an LTS tagged version in NPM belongs to the
  // last-minor branch of a given major (i.e. we assume there are no outdated LTS NPM dist tags).
  for (const npmDistTag in distTags) {
    if (isLtsDistTag(npmDistTag)) {
      const version = semver.parse(distTags[npmDistTag])!;
      const branchName = `${version.major}.${version.minor}.x`;
      const majorReleaseDate = new Date(time[`${version.major}.0.0`]);
      const ltsEndDate = computeLtsEndDateOfMajor(majorReleaseDate);
      const ltsBranch: LtsBranch = {name: branchName, version, npmDistTag};
      // Depending on whether the LTS phase is still active, add the branch
      // to the list of active or inactive LTS branches.
      if (today <= ltsEndDate) {
        active.push(ltsBranch);
      } else {
        inactive.push(ltsBranch);
      }
    }
  }

  // Sort LTS branches in descending order. i.e. most recent ones first.
  active.sort((a, b) => semver.rcompare(a.version, b.version));
  inactive.sort((a, b) => semver.rcompare(a.version, b.version));

  return {active, inactive};
}

/** Gets whether the specified tag corresponds to a LTS dist tag. */
export function isLtsDistTag(tagName: string): tagName is LtsNpmDistTag {
  return ltsNpmDistTagRegex.test(tagName);
}

/**
 * Computes the date when long-term support ends for a major released at the
 * specified date.
 */
export function computeLtsEndDateOfMajor(majorReleaseDate: Date): Date {
  return new Date(
      majorReleaseDate.getFullYear(),
      majorReleaseDate.getMonth() + majorActiveSupportDuration + majorLongTermSupportDuration,
      majorReleaseDate.getDate(), majorReleaseDate.getHours(), majorReleaseDate.getMinutes(),
      majorReleaseDate.getSeconds(), majorReleaseDate.getMilliseconds());
}

/** Gets the long-term support NPM dist tag for a given major version. */
export function getLtsNpmDistTagOfMajor(major: number): LtsNpmDistTag {
  // LTS versions should be tagged in NPM in the following format: `v{major}-lts`.
  return `v${major}-lts` as const;
}
