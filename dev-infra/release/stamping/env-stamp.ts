/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import {SemVer} from 'semver';
import {GitClient} from '../../utils/git/git-client';
import {createExperimentalSemver} from '../../utils/semver';

export type EnvStampMode = 'snapshot'|'release';

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
export function buildEnvStamp(mode: EnvStampMode) {
  console.info(`BUILD_SCM_BRANCH ${getCurrentBranch()}`);
  console.info(`BUILD_SCM_COMMIT_SHA ${getCurrentBranchOrRevision()}`);
  console.info(`BUILD_SCM_HASH ${getCurrentBranchOrRevision()}`);
  console.info(`BUILD_SCM_LOCAL_CHANGES ${hasLocalChanges()}`);
  console.info(`BUILD_SCM_USER ${getCurrentGitUser()}`);
  const {version, experimentalVersion} = getSCMVersions(mode);
  console.info(`BUILD_SCM_VERSION ${version}`);
  console.info(`BUILD_SCM_EXPERIMENTAL_VERSION ${experimentalVersion}`);
  process.exit();
}

/** Whether the repo has local changes. */
function hasLocalChanges() {
  try {
    const git = GitClient.get();
    return git.hasUncommittedChanges();
  } catch {
    return true;
  }
}

/**
 * Get the versions for generated packages.
 *
 * In snapshot mode, the version is based on the most recent semver tag.
 * In release mode, the version is based on the base package.json version.
 */
function getSCMVersions(mode: EnvStampMode): {version: string, experimentalVersion: string} {
  try {
    const git = GitClient.get();
    if (mode === 'snapshot') {
      const localChanges = hasLocalChanges() ? '.with-local-changes' : '';
      const {stdout: rawVersion} =
          git.run(['describe', '--match', '*[0-9]*.[0-9]*.[0-9]*', '--abbrev=7', '--tags', 'HEAD']);
      const {version} = new SemVer(rawVersion);
      const {version: experimentalVersion} = createExperimentalSemver(version);
      return {
        version: `${version.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
        experimentalVersion:
            `${experimentalVersion.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
      };
    } else {
      const packageJsonPath = join(git.baseDir, 'package.json');
      const {version} = new SemVer(require(packageJsonPath).version);
      const {version: experimentalVersion} = createExperimentalSemver(new SemVer(version));
      return {version, experimentalVersion};
    }
  } catch {
    return {
      version: '',
      experimentalVersion: '',
    };
  }
}

/** Get the current branch or revision of HEAD. */
function getCurrentBranchOrRevision() {
  try {
    const git = GitClient.get();
    return git.getCurrentBranchOrRevision();
  } catch {
    return '';
  }
}

/** Get the currently checked out branch. */
function getCurrentBranch() {
  try {
    const git = GitClient.get();
    return git.run(['symbolic-ref', '--short', 'HEAD']).stdout.trim();
  } catch {
    return '';
  }
}

/** Get the current git user based on the git config. */
function getCurrentGitUser() {
  try {
    const git = GitClient.get();
    let userName = git.runGraceful(['config', 'user.name']).stdout.trim() || 'Unknown User';
    let userEmail = git.runGraceful(['config', 'user.email']).stdout.trim() || 'unknown_email';
    return `${userName} <${userEmail}>`;
  } catch {
    return '';
  }
}
