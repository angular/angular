/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {getConfig, getRepoBaseDir} from '../../utils/config';
import {error, green, info, promptConfirm, red, yellow} from '../../utils/console';
import {GithubApiRequestError} from '../../utils/git/github';
import {GITHUB_TOKEN_GENERATE_URL} from '../../utils/git/github-urls';
import {GitClient} from '../../utils/git/index';

import {loadAndValidateConfig, MergeConfigWithRemote} from './config';
import {MergeResult, MergeStatus, PullRequestMergeTask, PullRequestMergeTaskFlags} from './task';

/**
 * Merges a given pull request based on labels configured in the given merge configuration.
 * Pull requests can be merged with different strategies such as the Github API merge
 * strategy, or the local autosquash strategy. Either strategy has benefits and downsides.
 * More information on these strategies can be found in their dedicated strategy classes.
 *
 * See {@link GithubApiMergeStrategy} and {@link AutosquashMergeStrategy}
 *
 * @param prNumber Number of the pull request that should be merged.
 * @param githubToken Github token used for merging (i.e. fetching and pushing)
 * @param projectRoot Path to the local Git project that is used for merging.
 * @param config Configuration for merging pull requests.
 */
export async function mergePullRequest(
    prNumber: number, githubToken: string, flags: PullRequestMergeTaskFlags) {
  // Set the environment variable to skip all git commit hooks triggered by husky. We are unable to
  // rely on `--no-verify` as some hooks still run, notably the `prepare-commit-msg` hook.
  process.env['HUSKY'] = '0';

  const api = await createPullRequestMergeTask(githubToken, flags);

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
        error(red('Github API request failed. ' + e.message));
        error(yellow('Please ensure that your provided token is valid.'));
        error(yellow(`You can generate a token here: ${GITHUB_TOKEN_GENERATE_URL}`));
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
   * @returns Whether the merge completed without errors or not.
   */
  async function handleMergeResult(result: MergeResult, disableForceMergePrompt = false) {
    const {failure, status} = result;
    const canForciblyMerge = failure && failure.nonFatal;

    switch (status) {
      case MergeStatus.SUCCESS:
        info(green(`Successfully merged the pull request: #${prNumber}`));
        return true;
      case MergeStatus.DIRTY_WORKING_DIR:
        error(
            red(`Local working repository not clean. Please make sure there are ` +
                `no uncommitted changes.`));
        return false;
      case MergeStatus.UNKNOWN_GIT_ERROR:
        error(
            red('An unknown Git error has been thrown. Please check the output ' +
                'above for details.'));
        return false;
      case MergeStatus.GITHUB_ERROR:
        error(red('An error related to interacting with Github has been discovered.'));
        error(failure!.message);
        return false;
      case MergeStatus.USER_ABORTED:
        info(`Merge of pull request has been aborted manually: #${prNumber}`);
        return true;
      case MergeStatus.FAILED:
        error(yellow(`Could not merge the specified pull request.`));
        error(red(failure!.message));
        if (canForciblyMerge && !disableForceMergePrompt) {
          info();
          info(yellow('The pull request above failed due to non-critical errors.'));
          info(yellow(`This error can be forcibly ignored if desired.`));
          return await promptAndPerformForceMerge();
        }
        return false;
      default:
        throw Error(`Unexpected merge result: ${status}`);
    }
  }
}

/**
 * Creates the pull request merge task from the given Github token, project root
 * and optional explicit configuration. An explicit configuration can be specified
 * when the merge script is used outside of a `ng-dev` configured repository.
 */
async function createPullRequestMergeTask(githubToken: string, flags: PullRequestMergeTaskFlags) {
  const projectRoot = getRepoBaseDir();
  const devInfraConfig = getConfig();
  const git = new GitClient(githubToken, devInfraConfig, projectRoot);
  const {config, errors} = await loadAndValidateConfig(devInfraConfig, git.github);

  if (errors) {
    error(red('Invalid merge configuration:'));
    errors.forEach(desc => error(yellow(`  -  ${desc}`)));
    process.exit(1);
  }

  // Set the remote so that the merge tool has access to information about
  // the remote it intends to merge to.
  config!.remote = devInfraConfig.github;
  // We can cast this to a merge config with remote because we always set the
  // remote above.
  return new PullRequestMergeTask(config! as MergeConfigWithRemote, git, flags);
}
