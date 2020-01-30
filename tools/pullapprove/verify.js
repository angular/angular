#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const parse = require('yaml').parse;
const readFileSync = require('fs').readFileSync;
const Minimatch = require('minimatch').Minimatch;
const exec = require('shelljs').exec;
const path = require('path');


// Whether to log verbosely
const VERBOSE_MODE = !!process.argv.find(arg =>  arg === `-v`);
// Full path to PullApprove config file
const PULL_APPROVE_YAML_PATH = path.resolve(__dirname, '../../.pullapprove.yml')
// All relative path file names in the git repo
const ALL_FILES = exec('git ls-tree --full-tree -r --name-only HEAD', {silent: true}).trim().split('\n').filter(_ => _);
if (!ALL_FILES.length) {
  console.error(
    `No files were found to be in the git tree, did you run this command from \n` +
    `inside the angular repository?`);
  process.exit(1);
}

/** Gets the glob matching information from each group's condition. */
function getGlobMatcherFromConditions(groupName, condition) {
  return condition
    .trim().split('\n').slice(1,-1)
    .map((glob) => {
      const match = glob.match(/'(.*)'/);
      return match && match[1];
    })
    .filter(globString => !!globString)
    .map(globString => ({
      group: groupName,
      glob: globString,
      matcher: new Minimatch(globString, {dot: true}),
      matchCount: 0,
    }));
}

/** Create logs for each review group. */
function logGroups(groups) {
  const globGroups = Array.from(groups.entries()).sort((a, b) => a[0] > b[0] ? 1 : -1);
  for (let globGroup of globGroups) {
    console.groupCollapsed(globGroup[0]);
    const globs = Array.from(globGroup[1].values()).sort((a,b) => b.matchCount - a.matchCount);
    for (let glob of globs) {
      console.log(`${glob.glob} - ${glob.matchCount}`);
    }
    console.groupEnd();
  }
}

/** Logs a header within a text drawn box. */
function logHeader(...params) {
  const totalWidth = 80;
  const fillWidth = totalWidth - 2;
  const headerText = [...params].join(' ').substr(0, fillWidth);
  const leftSpace = Math.ceil((fillWidth - headerText.length) / 2);
  const rightSpace = fillWidth - leftSpace - headerText.length;
  const fill = (count, content) => Array(++count).join(content);

  console.log(`┌${fill(fillWidth, '─')}┐`);
  console.log(`│${fill(leftSpace, ' ')}${headerText}${fill(rightSpace, ' ')}│`);
  console.log(`└${fill(fillWidth, '─')}┘`);
}

/** Runs the pull approve verification check on provided files. */
function runVerification(files) {
  // The pull approve config file.
  const pullApprove = readFileSync(PULL_APPROVE_YAML_PATH, {encoding: 'utf8'});
  // All of the PullApprove groups, parsed from the PullApprove yaml file.
  const parsedPullApproveGroups = parse(pullApprove).groups;
  // All of the globs created for each group's conditions.
  const allGlobs = [];
  // All files which were found to match a condition in PullApprove.
  const matchedFiles = new Set();
  // All files which were not found to match a condition in PullApprove.
  const unmatchedFiles = new Set();
  // All PullApprove groups which matched at least one file.
  const matchedGroups = new Map();
  // All PullApprove groups which did not match at least one file.
  const unmatchedGroups = new Map();

  // Get all of the globs from the PullApprove group conditions.
  Object.entries(parsedPullApproveGroups).map(([groupName, group]) => {
    for (let condition of group.conditions) {
      allGlobs.push(...getGlobMatcherFromConditions(groupName, condition))
    }
  })

  // Check each file for if it is matched by a PullApprove condition.
  for (let file of files) {
    const matched = allGlobs.filter(glob => glob.matcher.match(file));
    matched.length ? matchedFiles.add(file) : unmatchedFiles.add(file);
    matched.forEach(glob => glob.matchCount++);
  }

  // Add each glob for each group to a map either matched or unmatched.
  allGlobs.forEach(glob => {
    const groupsMap = glob.matchCount ? matchedGroups : unmatchedGroups;
    let groupMap = groupsMap.get(glob.group) || new Map()
    groupsMap.set(glob.group, groupMap);
    groupMap.set(glob.glob, glob);
  })

  // PullApprove is considered verified if no files or groups are found to be unsed.
  const verificationSucceeded = !(unmatchedFiles.size || unmatchedGroups.size);

  /**
   * Overall result
   */
  logHeader('Result')
  if (verificationSucceeded) {
    console.log(`PullApprove verification failed.\n`);
    console.log(`Please update '.pullapprove.yml' to ensure that all necessary`);
    console.log(`files/directories have owners and all patterns that appear in`);
    console.log(`the file correspond to actual files/directories in the repo.`);
  } else {
    console.log('PullApprove verification succeeded!');
  }
  /**
   * File by file Summary
   */
  logHeader('PullApprove file match results');
  console.groupCollapsed(`Matched Files (${matchedFiles.size} files)`);
  VERBOSE_MODE && Array.from(matchedFiles).forEach(file => console.log(file));
  console.groupEnd();
  console.groupCollapsed(`Unmatched Files (${unmatchedFiles.size} files)`);
  for (let file of Array.from(unmatchedFiles)) { console.log(file); }
  console.groupEnd();

  /**
   * Group by group Summary
   */
  logHeader('PullApprove group matches');
  console.groupCollapsed(`Matched Groups (${matchedGroups.size} groups)`);
  VERBOSE_MODE && logGroups(matchedGroups);
  console.groupEnd();
  console.groupCollapsed(`Unmatched Groups (${unmatchedGroups.size} groups)`);
  logGroups(unmatchedGroups);
  console.groupEnd();

  // Provide correct exit code based on verification success.
  process.exit(verificationSucceeded ? 0 : 1);
}

runVerification(ALL_FILES);
