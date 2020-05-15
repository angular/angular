/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MergeResult, MergeStatus, PullRequestMergeTask} from './task';
import {GithubApiRequestError} from './git';
import chalk from 'chalk';
import {promptConfirm} from './console';
import {loadAndValidateConfig} from './config';
import {getRepoBaseDir} from '../../utils/config';

/** URL to the Github page where personal access tokens can be generated. */
export const GITHUB_TOKEN_GENERATE_URL = `https://github.com/settings/tokens`;


/**
 * Entry-point for the merge script CLI. The script can be used to merge individual pull requests
 * into branches based on the `PR target` labels that have been set in a configuration. The script
 * aims to reduce the manual work that needs to be performed to cherry-pick a PR into multiple
 * branches based on a target label.
 */
export async function mergePullRequest(prNumber: number, githubToken: string) {
  const projectRoot = getRepoBaseDir();
  const {config, errors} = loadAndValidateConfig();

  if (errors) {
    console.error(chalk.red('Invalid configuration:'));
    errors.forEach(desc => console.error(chalk.yellow(`  -  ${desc}`)));
    process.exit(1);
  }

  const api = new PullRequestMergeTask(projectRoot, config, githubToken);

  // Perform the merge. Force mode can be activated through a command line flag.
  // Alternatively, if the merge fails with non-fatal failures, the script
  // will prompt whether it should rerun in force mode.
  if (!await performMerge(false)) {
    process.exit(1);
  }

  /** Performs the merge and returns whether it was successful or not. */
  async function performMerge(ignoreFatalErrors: boolean): Promise<boolean> {
    try {
      const result = await api.merge(prNumber, ignoreFatalErrors);
      return await handleMergeResult(result, ignoreFatalErrors);
    } catch (e) {
      // Catch errors to the Github API for invalid requests. We want to
      // exit the script with a better explanation of the error.
      if (e instanceof GithubApiRequestError && e.status === 401) {
        console.error(chalk.red('Github API request failed. ' + e.message));
        console.error(chalk.yellow('Please ensure that your provided token is valid.'));
        console.error(chalk.yellow(`You can generate a token here: ${GITHUB_TOKEN_GENERATE_URL}`));
        process.exit(1);
      }
      throw e;
    }
  }

  /**
   * Prompts whether the specified pull request should be forcibly merged. If so, merges
   * the specified pull request forcibly (ignoring non-critical failures).
   * @returns Whether the specified pull request has been forcibly merged.
   */
  async function promptAndPerformForceMerge(): Promise<boolean> {
    if (await promptConfirm('Do you want to forcibly proceed with merging?')) {
      // Perform the merge in force mode. This means that non-fatal failures
      // are ignored and the merge continues.
      return performMerge(true);
    }
    return false;
  }

  /**
   * Handles the merge result by printing console messages, exiting the process
   * based on the result, or by restarting the merge if force mode has been enabled.
   * @returns Whether the merge was successful or not.
   */
  async function handleMergeResult(result: MergeResult, disableForceMergePrompt = false) {
    const {failure, status} = result;
    const canForciblyMerge = failure && failure.nonFatal;

    switch (status) {
      case MergeStatus.SUCCESS:
        console.info(chalk.green(`Successfully merged the pull request: ${prNumber}`));
        return true;
      case MergeStatus.DIRTY_WORKING_DIR:
        console.error(chalk.red(
            `Local working repository not clean. Please make sure there are ` +
            `no uncommitted changes.`));
        return false;
      case MergeStatus.UNKNOWN_GIT_ERROR:
        console.error(chalk.red(
            'An unknown Git error has been thrown. Please check the output ' +
            'above for details.'));
        return false;
      case MergeStatus.FAILED:
        console.error(chalk.yellow(`Could not merge the specified pull request.`));
        console.error(chalk.red(failure!.message));
        if (canForciblyMerge && !disableForceMergePrompt) {
          console.info();
          console.info(chalk.yellow('The pull request above failed due to non-critical errors.'));
          console.info(chalk.yellow(`This error can be forcibly ignored if desired.`));
          return await promptAndPerformForceMerge();
        }
        return false;
      default:
        throw Error(`Unexpected merge result: ${status}`);
    }
  }
}
