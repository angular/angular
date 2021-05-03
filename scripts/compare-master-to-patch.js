#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

/**
 * This script compares commits in master and patch branches to find the delta between them. This is
 * useful for release reviews, to make sure all the necessary commits were included into the patch
 * branch and there is no discrepancy.
 *
 * Additionally, lists all 'feat' commits that were merged to the patch branch to aid in ensuring
 * features are only released to master.
 */

const {exec} = require('shelljs');
const semver = require('semver');

// Ignore commits that have specific patterns in commit message, it's ok for these commits to be
// present only in one branch. Ignoring them reduced the "noise" in the final output.
const ignoreCommitPatterns = [
  'release:',
  'docs: release notes',
  // These commits are created to update cli command docs sources with the most recent sha (stored
  // in `aio/package.json`). Separate commits are generated for master and patch branches and since
  // it's purely an infrastructure-related change, we ignore these commits while comparing master
  // and patch diffs to look for delta.
  'build(docs-infra): upgrade cli command docs sources',
];

// Ignore feature commits that have specific patterns in commit message, it's ok for these commits
// to be present in patch branch.
const ignoreFeatureCheckPatterns = [
  // It is ok and in fact desirable for dev-infra features to be on the patch branch.
  'feat(dev-infra):'
];

// String to be displayed as a version for initial commits in a branch
// (before first release from that branch).
const initialVersion = 'initial';

// Helper methods

function execGitCommand(gitCommand) {
  const output = exec(gitCommand, {silent: true});
  if (output.code !== 0) {
    console.error(`Error: git command "${gitCommand}" failed: \n\n ${output.stderr}`);
    process.exit(1);
  }
  return output;
}

function toArray(rawGitCommandOutput) {
  return rawGitCommandOutput.trim().split('\n');
}

function maybeExtractReleaseVersion(commit) {
  const versionRegex = /release: cut the (.*?) release/;
  const matches = commit.match(versionRegex);
  return matches ? matches[1] || matches[2] : null;
}

// Checks whether commit message matches any patterns in ignore list.
function shouldIgnoreCommit(commitMessage, ignorePatterns) {
  return ignorePatterns.some(pattern => commitMessage.indexOf(pattern) > -1);
}

/**
 * @param rawGitCommits
 * @returns {Map<string, [string, string]>} - Map of commit message to [commit info, version]
 */
function collectCommitsAsMap(rawGitCommits) {
  const commits = toArray(rawGitCommits);
  const commitsMap = new Map();
  let version = initialVersion;
  commits.reverse().forEach((commit) => {
    const ignore = shouldIgnoreCommit(commit, ignoreCommitPatterns);
    // Keep track of the current version while going though the list of commits, so that we can use
    // this information in the output (i.e. display a version when a commit was introduced).
    version = maybeExtractReleaseVersion(commit) || version;
    if (!ignore) {
      // Extract original commit description from commit message, so that we can find matching
      // commit in other commit range. For example, for the following commit message:
      //
      //   15d3e741e9 feat: update the locale files (#33556)
      //
      // we extract only "feat: update the locale files" part and use it as a key, since commit SHA
      // and PR number may be different for the same commit in master and patch branches.
      const key = commit.slice(11).replace(/\(\#\d+\)/g, '').trim();
      commitsMap.set(key, [commit, version]);
    }
  });
  return commitsMap;
}

function getCommitInfoAsString(version, commitInfo) {
  const formattedVersion = version === initialVersion ? version : `${version}+`;
  return `[${formattedVersion}] ${commitInfo}`;
}

/**
 * Returns a list of items present in `mapA`, but *not* present in `mapB`.
 * This function is needed to compare 2 sets of commits and return the list of unique commits in the
 * first set.
 */
function diff(mapA, mapB) {
  const result = [];
  mapA.forEach((value, key) => {
    if (!mapB.has(key)) {
      result.push(getCommitInfoAsString(value[1], value[0]));
    }
  });
  return result;
}

/**
 * @param {Map<string, [string, string]>} commitsMap - commit map from collectCommitsAsMap
 * @returns {string[]} List of commits with commit messages that start with 'feat'
 */
function listFeatures(commitsMap) {
  return Array.from(commitsMap.keys()).reduce((result, key) => {
    if (key.startsWith('feat') && !shouldIgnoreCommit(key, ignoreFeatureCheckPatterns)) {
      const value = commitsMap.get(key);
      result.push(getCommitInfoAsString(value[1], value[0]));
    }
    return result;
  }, []);
}

function getBranchByTag(tag) {
  const version = semver(tag);
  return `${version.major}.${version.minor}.x`;  // e.g. 9.0.x
}

function getLatestTag(tags) {
  // Exclude Next releases, since we cut them from master, so there is nothing to compare.
  const isNotNextVersion = version => version.indexOf('-next') === -1;
  return tags.filter(semver.valid)
      .filter(isNotNextVersion)
      .map(semver.clean)
      .sort(semver.rcompare)[0];
}

// Main program
function main() {
  execGitCommand('git fetch upstream');

  // Extract tags information and pick the most recent version
  // that we'll use later to compare with master.
  const tags = toArray(execGitCommand('git tag'));
  const latestTag = getLatestTag(tags);

  // Based on the latest tag, generate the name of the patch branch.
  const branch = getBranchByTag(latestTag);

  // Extract master-only and patch-only commits using `git log` command.
  const masterCommits = execGitCommand(
      `git log --cherry-pick --oneline --right-only upstream/${branch}...upstream/master`);
  const patchCommits = execGitCommand(
      `git log --cherry-pick --oneline --left-only upstream/${branch}...upstream/master`);

  // Post-process commits and convert raw data into a Map, so that we can diff it easier.
  const masterCommitsMap = collectCommitsAsMap(masterCommits);
  const patchCommitsMap = collectCommitsAsMap(patchCommits);

  // tslint:disable-next-line:no-console
  console.log(`
Comparing branches "${branch}" and master.

***** Only in MASTER *****
${diff(masterCommitsMap, patchCommitsMap).join('\n') || 'No extra commits'}

***** Only in PATCH (${branch}) *****
${diff(patchCommitsMap, masterCommitsMap).join('\n') || 'No extra commits'}

***** Features in PATCH (${branch}) - should always be empty *****
${listFeatures(patchCommitsMap).join('\n') || 'No extra commits'}
`);
}

main();
