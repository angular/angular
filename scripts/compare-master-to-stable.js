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

const shell = require('shelljs');
const semver = require('semver');

// Ignore commits that have specific patterns in commit message, it's ok for these commits to be
// present only in one branch. Ignoring them reduced the "noise" in the final output.
const ignorePatterns = [
  'release:',
  'docs:',
  'build(docs-infra): upgrade cli command docs',
];

// Helper methods

function execGitCommand(gitCommand) {
  const output = shell.exec(gitCommand, {silent: true});
  if (output.code !== 0) {
    console.error(`Error: git command "${gitCommand}" failed: \n\n ${output.stderr}`);
    process.exit(1);
  }
  return output;
}

function getAsArray(gitCommand) {
  return execGitCommand(gitCommand).split('\n');
}

function maybeExtractReleaseVersion(commit) {
  const versionRegex = /release: cut the (.*?) release|docs: release notes for the (.*?) release/;
  const matches = commit.match(versionRegex);
  return matches ? matches[1] || matches[2] : null;
}

function toMap(input) {
  let version = 'initial';
  const data = [];
  input.reverse().forEach((item) => {
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
      data.push([key, [item, version]]);
    }
  });
  return new Map(data);
}

function diff(mapA, mapB) {
  const result = [];
  mapA.forEach((value, key) => {
    if (!mapB.has(key)) {
      result.push(`[${value[1]}] ${value[0]}`);
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

const tags = getAsArray('git tag');
const latestTag = getLatestTag(tags);

const branch = getBranchByTag(latestTag);

const masterCommits =
    getAsArray(`git log --cherry-pick --oneline --right-only ${branch}...upstream/master`);
const patchCommits =
    getAsArray(`git log --cherry-pick --oneline --left-only ${branch}...upstream/master`);

const masterMap = toMap(masterCommits);
const patchMap = toMap(patchCommits);

console.log(`
Comparing branches "${branch}" and master.

***** Only in MASTER *****
${diff(masterMap, patchMap).join('\n') || 'No extra commits'}

***** Only in PATCH (${branch}) *****
${diff(patchMap, masterMap).join('\n') || 'No extra commits'}
`);