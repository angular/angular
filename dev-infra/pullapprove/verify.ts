/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {readFileSync} from 'fs';
import {resolve} from 'path';

import {getRepoBaseDir} from '../utils/config';
import {debug, info} from '../utils/console';
import {allFiles} from '../utils/repo-files';
import {logGroup, logHeader} from './logging';
import {getGroupsFromYaml} from './parse-yaml';

export function verify() {
  /** Full path to PullApprove config file */
  const PULL_APPROVE_YAML_PATH = resolve(getRepoBaseDir(), '.pullapprove.yml');
  /** All tracked files in the repository. */
  const REPO_FILES = allFiles();
  /** The pull approve config file. */
  const pullApproveYamlRaw = readFileSync(PULL_APPROVE_YAML_PATH, 'utf8');
  /** All of the groups defined in the pullapprove yaml. */
  const groups = getGroupsFromYaml(pullApproveYamlRaw);
  /**
   * PullApprove groups without conditions. These are skipped in the verification
   * as those would always be active and cause zero unmatched files.
   */
  const groupsSkipped = groups.filter(group => !group.conditions.length);
  /** PullApprove groups with conditions. */
  const groupsWithConditions = groups.filter(group => !!group.conditions.length);
  /** Files which are matched by at least one group. */
  const matchedFiles: string[] = [];
  /** Files which are not matched by at least one group. */
  const unmatchedFiles: string[] = [];

  // Test each file in the repo against each group for being matched.
  REPO_FILES.forEach((file: string) => {
    if (groupsWithConditions.filter(group => group.testFile(file)).length) {
      matchedFiles.push(file);
    } else {
      unmatchedFiles.push(file);
    }
  });
  /** Results for each group */
  const resultsByGroup = groupsWithConditions.map(group => group.getResults());
  /**
   * Whether all group condition lines match at least one file and all files
   * are matched by at least one group.
   */
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
  matchedFiles.forEach(file => debug(file));
  info.groupEnd();
  info.group(`Unmatched Files (${unmatchedFiles.length} files)`);
  unmatchedFiles.forEach(file => info(file));
  info.groupEnd();
  /**
   * Group by group Summary
   */
  logHeader('PullApprove results by group');
  info.group(`Groups skipped (${groupsSkipped.length} groups)`);
  groupsSkipped.forEach(group => debug(`${group.groupName}`));
  info.groupEnd();
  const matchedGroups = resultsByGroup.filter(group => !group.unmatchedCount);
  info.group(`Matched conditions by Group (${matchedGroups.length} groups)`);
  matchedGroups.forEach(group => logGroup(group, 'matchedConditions', debug));
  info.groupEnd();
  const unmatchedGroups = resultsByGroup.filter(group => group.unmatchedCount);
  info.group(`Unmatched conditions by Group (${unmatchedGroups.length} groups)`);
  unmatchedGroups.forEach(group => logGroup(group, 'unmatchedConditions'));
  info.groupEnd();
  const unverifiableConditionsInGroups =
      resultsByGroup.filter(group => group.unverifiableConditions.length > 0);
  info.group(`Unverifiable conditions by Group (${unverifiableConditionsInGroups.length} groups)`);
  unverifiableConditionsInGroups.forEach(group => logGroup(group, 'unverifiableConditions'));
  info.groupEnd();

  // Provide correct exit code based on verification success.
  process.exit(verificationSucceeded ? 0 : 1);
}
