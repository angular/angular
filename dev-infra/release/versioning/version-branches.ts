/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';
import {GithubClient, GithubRepo} from '../../utils/git/github';

/** Type describing a Github repository with corresponding API client. */
export interface GithubRepoWithApi extends GithubRepo {
  /** API client that can access the repository. */
  api: GithubClient;
}

/** Type describing a version-branch. */
export interface VersionBranch {
  /** Name of the branch in Git. e.g. `10.0.x`. */
  name: string;
  /**
   * Parsed SemVer version for the version-branch. Version branches technically do
   * not follow the SemVer format, but we can have representative SemVer versions
   * that can be used for comparisons, sorting and other checks.
   */
  parsed: semver.SemVer;
}

/** Regular expression that matches version-branches. */
const versionBranchNameRegex = /^(\d+)\.(\d+)\.x$/;

/** Gets the version of a given branch by reading the `package.json` upstream. */
export async function getVersionOfBranch(
    repo: GithubRepoWithApi, branchName: string): Promise<semver.SemVer> {
  const {data} = await repo.api.repos.getContents(
      {owner: repo.owner, repo: repo.name, path: '/package.json', ref: branchName});
  const {version} = JSON.parse(Buffer.from(data.content, 'base64').toString()) as
      {version: string, [key: string]: any};
  const parsedVersion = semver.parse(version);
  if (parsedVersion === null) {
    throw Error(`Invalid version detected in following branch: ${branchName}.`);
  }
  return parsedVersion;
}

/** Whether the given branch corresponds to a version branch. */
export function isVersionBranch(branchName: string): boolean {
  return versionBranchNameRegex.test(branchName);
}

/**
 * Converts a given version-branch into a SemVer version that can be used with SemVer
 * utilities. e.g. to determine semantic order, extract major digit, compare.
 *
 * For example `10.0.x` will become `10.0.0` in SemVer. The patch digit is not
 * relevant but needed for parsing. SemVer does not allow `x` as patch digit.
 */
export function getVersionForVersionBranch(branchName: string): semver.SemVer|null {
  return semver.parse(branchName.replace(versionBranchNameRegex, '$1.$2.0'));
}

/**
 * Gets the version branches for the specified major versions in descending
 * order. i.e. latest version branches first.
 */
export async function getBranchesForMajorVersions(
    repo: GithubRepoWithApi, majorVersions: number[]): Promise<VersionBranch[]> {
  const {data: branchData} =
      await repo.api.repos.listBranches({owner: repo.owner, repo: repo.name, protected: true});
  const branches: VersionBranch[] = [];

  for (const {name} of branchData) {
    if (!isVersionBranch(name)) {
      continue;
    }
    // Convert the version-branch into a SemVer version that can be used with the
    // SemVer utilities. e.g. to determine semantic order, compare versions.
    const parsed = getVersionForVersionBranch(name);
    // Collect all version-branches that match the specified major versions.
    if (parsed !== null && majorVersions.includes(parsed.major)) {
      branches.push({name, parsed});
    }
  }

  // Sort captured version-branches in descending order.
  return branches.sort((a, b) => semver.rcompare(a.parsed, b.parsed));
}
