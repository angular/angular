/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';
import {exec} from '../../utils/shelljs';

/**
 * Helper function that can be used to determine merge branches based on a given
 * project version. The function determines merge branches primarily through the
 * specified version, but falls back to consulting the NPM registry when needed.
 *
 * Consulting the NPM registry for determining the patch branch may slow down merging,
 * so whenever possible, the branches are determined statically based on the current
 * version. In some cases, consulting the NPM registry is inevitable because for major
 * pre-releases, we cannot determine the latest stable minor version from the current
 * pre-release version.
 */
export function determineMergeBranches(
    currentVersion: string, npmPackageName: string): {minor: string, patch: string} {
  const projectVersion = semver.parse(currentVersion);
  if (projectVersion === null) {
    throw Error('Cannot parse version set in project "package.json" file.');
  }
  const {major, minor, patch, prerelease} = projectVersion;
  const isMajor = minor === 0 && patch === 0;
  const isMinor = minor !== 0 && patch === 0;

  // If there is no prerelease, then we compute patch and minor branches based
  // on the current version major and minor.
  if (prerelease.length === 0) {
    return {minor: `${major}.x`, patch: `${major}.${minor}.x`};
  }

  // If current version is set to a minor prerelease, we can compute the merge branches
  // statically. e.g. if we are set to `9.3.0-next.0`, then our merge branches should
  // be set to `9.x` and `9.2.x`.
  if (isMinor) {
    return {minor: `${major}.x`, patch: `${major}.${minor - 1}.x`};
  } else if (!isMajor) {
    throw Error('Unexpected version. Cannot have prerelease for patch version.');
  }

  // If we are set to a major prerelease, we cannot statically determine the stable patch
  // branch (as the latest minor segment is unknown). We determine it by looking in the NPM
  // registry for the latest stable release that will tell us about the current minor segment.
  // e.g. if the current major is `v10.0.0-next.0`, then we need to look for the latest release.
  // Let's say this is `v9.2.6`. Our patch branch will then be called `9.2.x`.
  const latestVersion = exec(`yarn -s info ${npmPackageName} dist-tags.latest`).trim();
  if (!latestVersion) {
    throw Error('Could not determine version of latest release.');
  }
  const expectedMajor = major - 1;
  const parsedLatestVersion = semver.parse(latestVersion);
  if (parsedLatestVersion === null) {
    throw Error(`Could not parse latest version from NPM registry: ${latestVersion}`);
  } else if (parsedLatestVersion.major !== expectedMajor) {
    throw Error(
        `Expected latest release to have major version: v${expectedMajor}, ` +
        `but got: v${latestVersion}`);
  }

  return {patch: `${expectedMajor}.${parsedLatestVersion.minor}.x`, minor: `${expectedMajor}.x`};
}
