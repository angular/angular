/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import chalk from 'chalk';
import * as minimist from 'minimist';
import {isAbsolute, resolve} from 'path';

import {Config, readAndValidateConfig} from './config';
import {promptConfirm} from './console';
import {MergeResult, MergeStatus, PullRequestMergeTask} from './index';

// Run the CLI.
main();

/**
 * Entry-point for the merge script CLI. The script can be used to merge individual pull requests
 * into branches based on the `PR target` labels that have been set in a configuration. The script
 * aims to reduce the manual work that needs to be performed to cherry-pick a PR into multiple
 * branches based on a target label.
 */
async function main() {
  const {config, prNumber, force, githubToken} = parseCommandLine();
  const api = new PullRequestMergeTask(config, githubToken);

  // Perform the merge. Force mode can be activated through a command line flag.
  // Alternatively, if the merge fails with non-fatal failures, the script
  // will prompt whether it should rerun in force mode.
  const mergeResult = await api.merge(prNumber, force);

  // Handle the result of the merge. If failures have been reported, exit
  // the process with a non-zero exit code.
  if (!await handleMergeResult(mergeResult, force)) {
    process.exit(1);
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
      const forceMergeResult = await api.merge(prNumber, true);
      // Handle the merge result. Note that we disable the force merge prompt since
      // a failed force merge will never succeed with a second force merge.
      return await handleMergeResult(forceMergeResult, true);
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

// TODO(devversion): Use Yargs for this once the script has been moved to `angular/angular`.
/** Parses the command line and returns the passed options. */
function parseCommandLine():
    {config: Config, force: boolean, prNumber: number, dryRun?: boolean, githubToken: string} {
  const {config: configPath, githubToken: githubTokenArg, force, _: [prNumber]} =
      minimist<any>(process.argv.slice(2), {
        string: ['githubToken', 'config', 'pr'],
        alias: {
          'githubToken': 'github-token',
        },
      });

  if (!configPath) {
    console.error(chalk.red('No configuration file specified. Please pass the `--config` option.'));
    process.exit(1);
  }

  if (!prNumber) {
    console.error(chalk.red('No pull request specified. Please pass a pull request number.'));
    process.exit(1);
  }

  const configFilePath = isAbsolute(configPath) ? configPath : resolve(configPath);
  const {config, errors} = readAndValidateConfig(configFilePath);

  if (errors) {
    console.error(chalk.red('Configuration could not be read:'));
    errors.forEach(desc => console.error(chalk.yellow(`  *  ${desc}`)));
    process.exit(1);
  }

  const githubToken = githubTokenArg || process.env.GITHUB_TOKEN || process.env.TOKEN;
  if (!githubToken) {
    console.error(
        chalk.red('No Github token is set. Please set the `GITHUB_TOKEN` environment variable.'));
    console.error(chalk.red('Alternatively, pass the `--github-token` command line flag.'));
    process.exit(1);
  }

  return {config: config!, prNumber, githubToken, force};
}
