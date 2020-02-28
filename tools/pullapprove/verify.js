#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* tslint:disable:no-console  */
const parseYaml = require('yaml').parse;
const readFileSync = require('fs').readFileSync;
const Minimatch = require('minimatch').Minimatch;
const {exec, set, cd} = require('shelljs');
const path = require('path');

// Exit early on shelljs errors
set('-e');

// Regex Matcher for contains_any_globs conditions
const CONTAINS_ANY_GLOBS_REGEX = /^'([^']+)',?$/;

// Full path of the angular project directory
const ANGULAR_PROJECT_DIR = path.resolve(__dirname, '../..');
// Change to the Angular project directory
cd(ANGULAR_PROJECT_DIR);

// Whether to log verbosely
const VERBOSE_MODE = process.argv.includes('-v');
// Full path to PullApprove config file
const PULL_APPROVE_YAML_PATH = path.resolve(ANGULAR_PROJECT_DIR, '.pullapprove.yml');
// All relative path file names in the git repo, this is retrieved using git rather
// that a glob so that we only get files that are checked in, ignoring things like
// node_modules, .bazelrc.user, etc
const ALL_FILES = exec('git ls-tree --full-tree -r --name-only HEAD', {silent: true})
                      .trim()
                      .split('\n')
                      .filter(_ => _);
if (!ALL_FILES.length) {
  console.error(
      `No files were found to be in the git tree, did you run this command from \n` +
      `inside the angular repository?`);
  process.exit(1);
}

/** Gets the glob matching information from each group's condition. */
function getGlobMatchersFromCondition(groupName, condition) {
  const trimmedCondition = condition.trim();
  const globMatchers = [];
  const badConditionLines = [];

  // If the condition starts with contains_any_globs, evaluate all of the globs
  if (trimmedCondition.startsWith('contains_any_globs')) {
    trimmedCondition.split('\n')
        .slice(1, -1)
        .map(glob => {
          const trimmedGlob = glob.trim();
          const match = trimmedGlob.match(CONTAINS_ANY_GLOBS_REGEX);
          if (!match) {
            badConditionLines.push(trimmedGlob);
            return;
          }
          return match[1];
        })
        .filter(globString => !!globString)
        .forEach(globString => globMatchers.push({
          group: groupName,
          glob: globString,
          matcher: new Minimatch(globString, {dot: true}),
          matchCount: 0,
        }));
  }
  return [globMatchers, badConditionLines];
}

/** Create logs for each review group. */
function logGroups(groups) {
  Array.from(groups.entries()).sort().forEach(([groupName, globs]) => {
    console.groupCollapsed(groupName);
    Array.from(globs.values())
        .sort((a, b) => b.matchCount - a.matchCount)
        .forEach(glob => console.log(`${glob.glob} - ${glob.matchCount}`));
    console.groupEnd();
  });
}

/** Logs a header within a text drawn box. */
function logHeader(...params) {
  const totalWidth = 80;
  const fillWidth = totalWidth - 2;
  const headerText = params.join(' ').substr(0, fillWidth);
  const leftSpace = Math.ceil((fillWidth - headerText.length) / 2);
  const rightSpace = fillWidth - leftSpace - headerText.length;
  const fill = (count, content) => content.repeat(count);

  console.log(`┌${fill(fillWidth, '─')}┐`);
  console.log(`│${fill(leftSpace, ' ')}${headerText}${fill(rightSpace, ' ')}│`);
  console.log(`└${fill(fillWidth, '─')}┘`);
}

/** Runs the pull approve verification check on provided files. */
function runVerification(files) {
  // All of the globs created for each group's conditions.
  const allGlobs = [];
  // The pull approve config file.
  const pullApprove = readFileSync(PULL_APPROVE_YAML_PATH, {encoding: 'utf8'});
  // All of the PullApprove groups, parsed from the PullApprove yaml file.
  const parsedPullApproveGroups = parseYaml(pullApprove).groups;
  // All files which were found to match a condition in PullApprove.
  const matchedFiles = new Set();
  // All files which were not found to match a condition in PullApprove.
  const unmatchedFiles = new Set();
  // All PullApprove groups which matched at least one file.
  const matchedGroups = new Map();
  // All PullApprove groups which did not match at least one file.
  const unmatchedGroups = new Map();
  // All condition lines which were not able to be correctly parsed, by group.
  const badConditionLinesByGroup = new Map();
  // Total number of condition lines which were not able to be correctly parsed.
  let badConditionLineCount = 0;

  // Get all of the globs from the PullApprove group conditions.
  Object.entries(parsedPullApproveGroups).map(([groupName, group]) => {
    for (const condition of group.conditions) {
      const [matchers, badConditions] = getGlobMatchersFromCondition(groupName, condition);
      if (badConditions.length) {
        badConditionLinesByGroup.set(groupName, badConditions);
        badConditionLineCount += badConditions.length;
      }
      allGlobs.push(...matchers);
    }
  });

  if (badConditionLineCount) {
    console.log(`Discovered ${badConditionLineCount} parsing errors in PullApprove conditions`);
    console.log(`Attempted parsing using: ${CONTAINS_ANY_GLOBS_REGEX}`);
    console.log();
    console.log(`Unable to properly parse the following line(s) by group:`);
    for (const [groupName, badConditionLines] of badConditionLinesByGroup.entries()) {
      console.log(`- ${groupName}:`);
      badConditionLines.forEach(line => console.log(`    ${line}`));
    }
    console.log();
    console.log(
        `Please correct the invalid conditions, before PullApprove verification can be completed`);
    process.exit(1);
  }

  // Check each file for if it is matched by a PullApprove condition.
  for (let file of files) {
    const matched = allGlobs.filter(glob => glob.matcher.match(file));
    matched.length ? matchedFiles.add(file) : unmatchedFiles.add(file);
    matched.forEach(glob => glob.matchCount++);
  }

  // Add each glob for each group to a map either matched or unmatched.
  allGlobs.forEach(glob => {
    const groups = glob.matchCount ? matchedGroups : unmatchedGroups;
    const globs = groups.get(glob.group) || new Map();
    // Set the globs map in the groups map
    groups.set(glob.group, globs);
    // Set the glob in the globs map
    globs.set(glob.glob, glob);
  });

  // PullApprove is considered verified if no files or groups are found to be unsed.
  const verificationSucceeded = !(unmatchedFiles.size || unmatchedGroups.size);

  /**
   * Overall result
   */
  logHeader('Result');
  if (verificationSucceeded) {
    console.log('PullApprove verification succeeded!');
  } else {
    console.log(`PullApprove verification failed.\n`);
    console.log(`Please update '.pullapprove.yml' to ensure that all necessary`);
    console.log(`files/directories have owners and all patterns that appear in`);
    console.log(`the file correspond to actual files/directories in the repo.`);
  }
  /**
   * File by file Summary
   */
  logHeader('PullApprove file match results');
  console.groupCollapsed(`Matched Files (${matchedFiles.size} files)`);
  VERBOSE_MODE && matchedFiles.forEach(file => console.log(file));
  console.groupEnd();
  console.groupCollapsed(`Unmatched Files (${unmatchedFiles.size} files)`);
  unmatchedFiles.forEach(file => console.log(file));
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
