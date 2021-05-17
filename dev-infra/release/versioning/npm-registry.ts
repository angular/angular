/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fetch from 'node-fetch';
import * as semver from 'semver';

import {ReleaseConfig} from '../config/index';
import {LtsNpmDistTag} from './long-term-support';

/** Type describing the possible NPM dist tags used by Angular packages. */
export type NpmDistTag = 'latest'|'next'|LtsNpmDistTag;

/** Type describing an NPM package fetched from the registry. */
export interface NpmPackageInfo {
  /** Maps of versions and their package JSON objects. */
  'versions': {[name: string]: undefined|object};
  /** Map of NPM dist-tags and their chosen version. */
  'dist-tags': {[tagName: string]: string|undefined};
  /** Map of versions and their ISO release time. */
  'time': {[name: string]: string};
}

/**
 * Cache for requested NPM package information. A cache is desirable as the NPM
 * registry requests are usually very large and slow.
 */
export const _npmPackageInfoCache: {[pkgName: string]: Promise<NpmPackageInfo>} = {};

/**
 * Fetches the NPM package representing the project. Angular repositories usually contain
 * multiple packages in a monorepo scheme, but packages dealt with as part of the release
 * tooling are released together with the same versioning and branching. This means that
 * a single package can be used as source of truth for NPM package queries.
 */
export async function fetchProjectNpmPackageInfo(config: ReleaseConfig): Promise<NpmPackageInfo> {
  const pkgName = getRepresentativeNpmPackage(config);
  return await fetchPackageInfoFromNpmRegistry(pkgName);
}

/** Gets whether the given version is published to NPM or not */
export async function isVersionPublishedToNpm(
    version: semver.SemVer, config: ReleaseConfig): Promise<boolean> {
  const {versions} = await fetchProjectNpmPackageInfo(config);
  return versions[version.format()] !== undefined;
}

/**
 * Gets the representative NPM package for the specified release configuration. Angular
 * repositories usually contain multiple packages in a monorepo scheme, but packages dealt with
 * as part of the release tooling are released together with the same versioning and branching.
 * This means that a single package can be used as source of truth for NPM package queries.
 */
function getRepresentativeNpmPackage(config: ReleaseConfig) {
  return config.npmPackages[0];
}

/** Fetches the specified NPM package from the NPM registry. */
async function fetchPackageInfoFromNpmRegistry(pkgName: string): Promise<NpmPackageInfo> {
  if (_npmPackageInfoCache[pkgName] === undefined) {
    _npmPackageInfoCache[pkgName] =
        fetch(`https://registry.npmjs.org/${pkgName}`).then(r => r.json());
  }
  return await _npmPackageInfoCache[pkgName];
}
