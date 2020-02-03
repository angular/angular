#!/usr/bin/env node

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

/**
 * This script compares commits in master and patch branches to find the delta between them. This is
 * useful for release reviews, to make sure all the necessary commits were included into the patch
 * branch and there is no discrepancy.
 */

const {exec} = require('shelljs');
const semver = require('semver');

// Ignore commits that have specific patterns in commit message, it's ok for these commits to be
// present only in one branch. Ignoring them reduced the "noise" in the final output.
const ignorePatterns = [
  'release:',
  'docs: release notes',
  // These commits are created to update cli command docs sources with the most recent sha (stored
  // in `aio/package.json`). Separate commits are generated for master and patch branches and since
  // it's purely an infrastructure-related change, we ignore these commits while comparing master
  // and patch diffs to look for delta.
  'build(docs-infra): upgrade cli command docs sources',
];

// Limit the log history to start from v9.0.0 release date.
// Note: this is needed only for 9.0.x branch to avoid RC history.
// Remove it once `9.1.x` branch is created.
const after = '--after="2020-02-05"';

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
  const versionRegex = /release: cut the (.*?) release|docs: release notes for the (.*?) release/;
  const matches = commit.match(versionRegex);
  return matches ? matches[1] || matches[2] : null;
}

function collectCommitsAsMap(rawGitCommits) {
  const commits = toArray(rawGitCommits);
  const commitsMap = new Map();
  let version = 'initial';
  commits.reverse().forEach((item) => {
    const skip = ignorePatterns.some(pattern => item.indexOf(pattern) > -1);
    // Keep track of the current version while going though the list of commits, so that we can use
    // this information in the output (i.e. display a version when a commit was introduced).
    version = maybeExtractReleaseVersion(item) || version;
    if (!skip) {
      // Extract original commit description from commit message, so that we can find matching
      // commit in other commit range. For example, for the following commit message:
      //
      //   15d3e741e9 feat: update the locale files (#33556)
      //
      // we extract only "feat: update the locale files" part and use it as a key, since commit SHA
      // and PR number may be different for the same commit in master and patch branches.
      const key = item.slice(11).replace(/\(\#\d+\)/g, '').trim();
      commitsMap.set(key, [item, version]);
    }
  });
  return commitsMap;
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
      result.push(`[${value[1]}+] ${value[0]}`);
    }
  });
  return result;
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
      `git log --cherry-pick --oneline --right-only ${after} upstream/${branch}...upstream/master`);
  const patchCommits = execGitCommand(
      `git log --cherry-pick --oneline --left-only ${after} upstream/${branch}...upstream/master`);

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
`);
}

main();