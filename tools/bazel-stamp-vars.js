#!/usr/bin/env node

/**
 * Bazel workspace status script that is responsible for creating Bazel stamping variables.
 * The stamping variables will be used by the NodeJS Bazel rules to provide proper version
 * placeholder replacements. Read more about variable stamping within Bazel:
 * https://docs.bazel.build/versions/master/user-manual.html#flag--workspace_status_command
 */

const spawnSync = require('child_process').spawnSync;
const packageJson = require('../package');

const currentCommitSha = getCurrentCommitSha();

// The "BUILD_SCM_VERSION" will be picked up by the "npm_package" and "ng_package"
// rule in order to populate the "0.0.0-PLACEHOLDER". Note that the SHA will be only
// appended for snapshots builds from within the "publish-build-artifacts.sh" script.
console.log(`BUILD_SCM_VERSION ${packageJson.version}`);
console.log(`BUILD_SCM_COMMIT_SHA ${currentCommitSha}`);
console.log(`BUILD_SCM_BRANCH ${getCurrentBranchName()}`);
console.log(`BUILD_SCM_USER ${getCurrentGitUser()}`);

/** Returns the commit SHA for the current git HEAD of the project. */
function getCurrentCommitSha() {
  return spawnSync('git', ['rev-parse', 'HEAD']).stdout.toString().trim();
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
