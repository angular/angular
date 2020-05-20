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

import {getRepoBaseDir} from '../utils/config';
import {info} from '../utils/console';

import {PullApproveGroup} from './group';
import {logGroup, logHeader} from './logging';
import {parsePullApproveYaml} from './parse-yaml';

export function verify(verbose = false) {
  // Exit early on shelljs errors
  set('-e');
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
  // PullApprove groups without conditions. These are skipped in the verification
  // as those would always be active and cause zero unmatched files.
  const groupsSkipped = groups.filter(group => !group.conditions.length);
  // PullApprove groups with conditions.
  const groupsWithConditions = groups.filter(group => !!group.conditions.length);
  // Files which are matched by at least one group.
  const matchedFiles: string[] = [];
  // Files which are not matched by at least one group.
  const unmatchedFiles: string[] = [];

  // Test each file in the repo against each group for being matched.
  REPO_FILES.forEach((file: string) => {
    if (groupsWithConditions.filter(group => group.testFile(file)).length) {
      matchedFiles.push(file);
    } else {
      unmatchedFiles.push(file);
    }
  });
  // Results for each group
  const resultsByGroup = groupsWithConditions.map(group => group.getResults());
  // Whether all group condition lines match at least one file and all files
  // are matched by at least one group.
  const verificationSucceeded =
      resultsByGroup.every(r => !r.unmatchedCount) && !unmatchedFiles.length;

  /**
   * Overall result
   */
  logHeader('Overall Result');
  if (verificationSucceeded) {
    info('PullApprove verification succeeded!');
  } else {
    info(`PullApprove verification failed.`);
    info();
    info(`Please update '.pullapprove.yml' to ensure that all necessary`);
    info(`files/directories have owners and all patterns that appear in`);
    info(`the file correspond to actual files/directories in the repo.`);
  }
  /**
   * File by file Summary
   */
  logHeader('PullApprove results by file');
  info.group(`Matched Files (${matchedFiles.length} files)`);
  verbose && matchedFiles.forEach(file => info(file));
  info.groupEnd();
  info.group(`Unmatched Files (${unmatchedFiles.length} files)`);
  unmatchedFiles.forEach(file => info(file));
  info.groupEnd();
  /**
   * Group by group Summary
   */
  logHeader('PullApprove results by group');
  info.group(`Groups skipped (${groupsSkipped.length} groups)`);
  verbose && groupsSkipped.forEach(group => info(`${group.groupName}`));
  info.groupEnd();
  const matchedGroups = resultsByGroup.filter(group => !group.unmatchedCount);
  info.group(`Matched conditions by Group (${matchedGroups.length} groups)`);
  verbose && matchedGroups.forEach(group => logGroup(group));
  info.groupEnd();
  const unmatchedGroups = resultsByGroup.filter(group => group.unmatchedCount);
  info.group(`Unmatched conditions by Group (${unmatchedGroups.length} groups)`);
  unmatchedGroups.forEach(group => logGroup(group, false));
  info.groupEnd();

  // Provide correct exit code based on verification success.
  process.exit(verificationSucceeded ? 0 : 1);
}
