/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

/**
 * Increments a specified SemVer version. Compared to the original increment in SemVer,
 * the version is cloned to not modify the original version instance.
 */
export function semverInc(
    version: semver.SemVer, release: semver.ReleaseType, identifier?: string) {
  const clone = new semver.SemVer(version.version);
  return clone.inc(release, identifier);
}

/** Creates the equivalent experimental version for a provided SemVer. */
export function createExperimentalSemver(version: string|semver.SemVer): semver.SemVer {
  version = new semver.SemVer(version);
  const experimentalVersion = new semver.SemVer(version.format());
  experimentalVersion.major = 0;
  experimentalVersion.minor = version.major * 100 + version.minor;
  return new semver.SemVer(experimentalVersion.format());
}
