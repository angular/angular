#!/usr/bin/env node

/**
 * Bazel workspace status script that is responsible for creating Bazel stamping variables.
 * The stamping variables will be used by the NodeJS Bazel rules to provide proper version
 * placeholder replacements. Read more about variable stamping within Bazel:
 * https://docs.bazel.build/versions/master/user-manual.html#flag--workspace_status_command
 */

const spawnSync = require('child_process').spawnSync;
const packageJson = require('../package');
const isSnapshotStamp = process.argv.slice(2).includes('--snapshot');

// The "BUILD_SCM_VERSION" will be picked up by the "npm_package" and "ng_package"
// rule in order to populate the "0.0.0-PLACEHOLDER". Note that the SHA will be only
// appended for snapshots builds (if the `--snapshot` flag has been passed to this script).
console.log(`BUILD_SCM_VERSION ${getBuildVersion()}`);
console.log(`BUILD_SCM_COMMIT_SHA ${getCurrentCommitSha()}`);
console.log(`BUILD_SCM_BRANCH ${getCurrentBranchName()}`);
console.log(`BUILD_SCM_USER ${getCurrentGitUser()}`);

/** Returns the commit SHA for the current git HEAD of the project. */
function getCurrentCommitSha() {
  return spawnSync('git', ['rev-parse', 'HEAD']).stdout.toString().trim();
}

/** Returns the abbreviated SHA for the current git HEAD of the project. */
function getAbbreviatedCommitSha() {
  return spawnSync('git', ['rev-parse', '--short', 'HEAD']).stdout.toString().trim();
}

/** Returns the name of the currently checked out branch of the project. */
function getCurrentBranchName() {
  return spawnSync('git', ['symbolic-ref', '--short', 'HEAD']).stdout.toString().trim();
}

/** Returns the name and email of the Git user that creates this release build. */
function getCurrentGitUser() {
  const userName = spawnSync('git', ['config', 'user.name']).stdout.toString().trim();
  const userEmail = spawnSync('git', ['config', 'user.email']).stdout.toString().trim();

  return `${userName} <${userEmail}>`;
}

/** Gets the version for the current build. */
function getBuildVersion() {
  if (isSnapshotStamp) {
    // Note that we cannot store the commit SHA as prerelease segment as it will not comply
    // with the semver specification in some situations. For example: `1.0.0-00abcdef` will
    // break since the SHA starts with zeros. To fix this, we create a prerelease segment with
    // label where the SHA is considered part of the label and not the prerelease number.
    // Here is an example of the valid format: "1.0.0-sha-00abcdef".
    // See issue: https://jubianchi.github.io/semver-check/#/^8.0.0/8.2.2-0462599
    return `${packageJson.version}-sha-${getAbbreviatedCommitSha()}`;
  }
  return packageJson.version;
}
