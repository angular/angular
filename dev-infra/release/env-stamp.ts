/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {exec as _exec} from '../utils/shelljs';

import {getReleaseConfig} from './config';

/**
 * Log the environment variables expected by bazel for stamping.
 *
 * See the section on stamping in docs / BAZEL.md
 *
 * This script must be a NodeJS script in order to be cross-platform.
 * See https://github.com/bazelbuild/bazel/issues/5958
 * Note: git operations, especially git status, take a long time inside mounted docker volumes
 * in Windows or OSX hosts (https://github.com/docker/for-win/issues/188).
 */
export function buildEnvStamp() {
  /** The configuration for the release tooling of ng-dev. */
  const config = getReleaseConfig();

  console.info(`BUILD_SCM_BRANCH ${getCurrentBranch()}`);
  console.info(`BUILD_SCM_COMMIT_SHA ${getCurrentSha()}`);
  console.info(`BUILD_SCM_HASH ${getCurrentSha()}`);
  console.info(`BUILD_SCM_LOCAL_CHANGES ${hasLocalChanges()}`);
  console.info(`BUILD_SCM_USER ${getCurrentGitUser()}`);
  console.info(`BUILD_SCM_VERSION ${getSCMVersion(config)}`);
  process.exit(0);
}

/** Run the exec command and return the stdout as a trimmed string. */
function exec(cmd: string) {
  return _exec(cmd).trim();
}

/** Whether the repo has local changes. */
function hasLocalChanges() {
  return !!exec(`git status --untracked-files=no --porcelain`);
}

/** Get the version based on the most recent semver tag. */
function getSCMVersion(config = getReleaseConfig()) {
  const prefix = config?.release?.tagPrefix || '';
  const version = exec(`git describe --match ${prefix}[0-9]*.[0-9]*.[0-9]* --abbrev=7 --tags HEAD`);
  const tagPrefixRegex = new RegExp(`^${prefix}`);
  const parsedVersion =
      version
          // Remove the semver tag prefix, i.e. `v` in `v1.0.0`
          .replace(tagPrefixRegex, '')
          // Replace the git indication of the distance from tag with a reference which does not
          // break semver. e.g.  0.0.0-next.0-44-abcd1234 becomes 0.0.0.next.0+44.sha-abcd1234
          .replace(/-([0-9]+)-g/, '+$1.sha-');
  return `${parsedVersion}${(hasLocalChanges() ? '.with-local-changes' : '')}`;
}

/** Get the current SHA of HEAD. */
function getCurrentSha() {
  return exec(`git rev-parse HEAD`);
}

/** Get the currently checked out branch. */
function getCurrentBranch() {
  return exec(`git symbolic-ref --short HEAD`);
}

/** Get the current git user based on the git config. */
function getCurrentGitUser() {
  const userName = exec(`git config user.name`);
  const userEmail = exec(`git config user.email`);

  return `${userName} <${userEmail}>`;
}
