'use strict';

const child = require('child_process');
const semver = require('semver');
const versionMatcher = /refs\/tags\/(\d+.+)$/mg;
const GIT = process.env.GIT_BIN; // Path provided via bazel git toolchain

/**
 * Get a collection of all the previous "last major" versions sorted by semantic version.
 *
 * @param packageInfo injected from dgeni-packages/git
 * @param versionInfo injected from dgeni-packages/git
 * @returns an array of SemVer objects
 */
module.exports = function getPreviousMajorVersions(packageInfo, versionInfo) {
  return () => {
    // always use the remote tags as the local clone might not contain all commits when cloned with
    // `git clone --depth=...`
    const repoUrl = packageInfo.repository.url;
    const tagResults = child.spawnSync(GIT, ['ls-remote', '--tags', repoUrl], {encoding: 'utf8'});

    if (tagResults.status !== 0) {
      return [];
    }

    const majorVersions = {};
    tagResults.stdout.replace(versionMatcher, (_, tag) => {
      const version = semver.parse(tag);

      // Not interested in tags that do not match semver format.
      if (version === null) {
        return;
      }

      // Not interested in pre-release versions.
      if (version.prerelease !== null && version.prerelease.length > 0) {
        return;
      }

      // Only interested in versions that are earlier than the current major.
      if (version.major >= versionInfo.currentVersion.major) {
        return;
      }

      const currentMajor = majorVersions[version.major];
      if (currentMajor === undefined || semver.compare(version, currentMajor) === 1) {
        // This version is newer than the currently captured version for this major.
        majorVersions[version.major] = version;
      }
    });

    // Sort them in descending order
    return semver.sort(Object.values(majorVersions)).reverse();
  };
};
