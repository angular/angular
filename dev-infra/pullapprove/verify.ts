/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {readFileSync} from 'fs';
import * as path from 'path';
import {cd, exec, set} from 'shelljs';

import {PullApproveGroup} from './group';
import {logGroup, logHeader} from './logging';
import {parsePullApproveYaml} from './parse-yaml';
import {getRepoBaseDir} from '../utils/config';

export function verify() {
  // Exit early on shelljs errors
  set('-e');
  // Whether to log verbosely
  const VERBOSE_MODE = process.argv.includes('-v');
  // Full path of the angular project directory
  const PROJECT_DIR = getRepoBaseDir();
  // Change to the Angular project directory
  cd(PROJECT_DIR);
  // Full path to PullApprove config file
  const PULL_APPROVE_YAML_PATH = path.resolve(PROJECT_DIR, '.pullapprove.yml');
  // All relative path file names in the git repo, this is retrieved using git rather
  // that a glob so that we only get files that are checked in, ignoring things like
  // node_modules, .bazelrc.user, etc
  const REPO_FILES =
      exec('git ls-files', {silent: true}).trim().split('\n').filter((_: string) => !!_);
  // The pull approve config file.
  const pullApproveYamlRaw = readFileSync(PULL_APPROVE_YAML_PATH, 'utf8');
  // JSON representation of the pullapprove yaml file.
  const pullApprove = parsePullApproveYaml(pullApproveYamlRaw);
  // All of the groups defined in the pullapprove yaml.
  const groups = Object.entries(pullApprove.groups).map(([groupName, group]) => {
    return new PullApproveGroup(groupName, group);
  });
  // PullApprove groups without matchers.
  const groupsWithoutMatchers = groups.filter(group => !group.hasMatchers);
  // PullApprove groups with matchers.
  const groupsWithMatchers = groups.filter(group => group.hasMatchers);
  // All lines from group conditions which are not parsable.
  const groupsWithBadLines = groups.filter(g => !!g.getBadLines().length);
  // If any groups contains bad lines, log bad lines and exit failing.
  if (groupsWithBadLines.length) {
    logHeader('PullApprove config file parsing failure');
    console.info(`Discovered errors in ${groupsWithBadLines.length} groups`);
    groupsWithBadLines.forEach(group => {
      console.info(` - [${group.groupName}]`);
      group.getBadLines().forEach(line => console.info(`    ${line}`));
    });
    console.info(
        `Correct the invalid conditions, before PullApprove verification can be completed`);
    process.exit(1);
  }
  // Files which are matched by at least one group.
  const matchedFiles: string[] = [];
  // Files which are not matched by at least one group.
  const unmatchedFiles: string[] = [];

  // Test each file in the repo against each group for being matched.
  REPO_FILES.forEach((file: string) => {
    if (groupsWithMatchers.filter(group => group.testFile(file)).length) {
      matchedFiles.push(file);
    } else {
      unmatchedFiles.push(file);
    }
  });
  // Results for each group
  const resultsByGroup = groupsWithMatchers.map(group => group.getResults());
  // Whether all group condition lines match at least one file and all files
  // are matched by at least one group.
  const verificationSucceeded =
      resultsByGroup.every(r => !r.unmatchedCount) && !unmatchedFiles.length;

  /**
   * Overall result
   */
  logHeader('Overall Result');
  if (verificationSucceeded) {
    console.info('PullApprove verification succeeded!');
  } else {
    console.info(`PullApprove verification failed.\n`);
    console.info(`Please update '.pullapprove.yml' to ensure that all necessary`);
    console.info(`files/directories have owners and all patterns that appear in`);
    console.info(`the file correspond to actual files/directories in the repo.`);
  }
  /**
   * File by file Summary
   */
  logHeader('PullApprove results by file');
  console.groupCollapsed(`Matched Files (${matchedFiles.length} files)`);
  VERBOSE_MODE && matchedFiles.forEach(file => console.info(file));
  console.groupEnd();
  console.groupCollapsed(`Unmatched Files (${unmatchedFiles.length} files)`);
  unmatchedFiles.forEach(file => console.info(file));
  console.groupEnd();
  /**
   * Group by group Summary
   */
  logHeader('PullApprove results by group');
  console.groupCollapsed(`Groups without matchers (${groupsWithoutMatchers.length} groups)`);
  VERBOSE_MODE && groupsWithoutMatchers.forEach(group => console.info(`${group.groupName}`));
  console.groupEnd();
  const matchedGroups = resultsByGroup.filter(group => !group.unmatchedCount);
  console.groupCollapsed(`Matched conditions by Group (${matchedGroups.length} groups)`);
  VERBOSE_MODE && matchedGroups.forEach(group => logGroup(group));
  console.groupEnd();
  const unmatchedGroups = resultsByGroup.filter(group => group.unmatchedCount);
  console.groupCollapsed(`Unmatched conditions by Group (${unmatchedGroups.length} groups)`);
  unmatchedGroups.forEach(group => logGroup(group, false));
  console.groupEnd();

  // Provide correct exit code based on verification success.
  process.exit(verificationSucceeded ? 0 : 1);
}
