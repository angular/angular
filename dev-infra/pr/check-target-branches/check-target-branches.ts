/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getConfig} from '../../utils/config';
import {error, info, red} from '../../utils/console';
import {GitClient} from '../../utils/git/index';
import {loadAndValidateConfig} from '../merge/config';
import {getBranchesFromTargetLabel, getTargetLabelFromPullRequest} from '../merge/target-label';

export async function checkTargetBranchesForPr(prNumber: number, jsonOutput = false) {
  /** The ng-dev configuration. */
  const config = getConfig();
  /** Repo owner and name for the github repository. */
  const {owner, name: repo} = config.github;
  /** The git client to get a Github API service instance. */
  const git = new GitClient(undefined, config);
  /** The validated merge config. */
  const {config: mergeConfig, errors} = await loadAndValidateConfig(config, git.github);
  if (errors !== undefined) {
    throw Error(`Invalid configuration found: ${errors}`);
  }
  /** The current state of the pull request from Github. */
  const prData = (await git.github.pulls.get({owner, repo, pull_number: prNumber})).data;
  /** The list of labels on the PR as strings. */
  const labels = prData.labels.map(l => l.name);
  /** The branch targetted via the Github UI. */
  const githubTargetBranch = prData.base.ref;
  /** The active label which is being used for targetting the PR. */
  const targetLabel = getTargetLabelFromPullRequest(mergeConfig!, labels);
  if (targetLabel === null) {
    error(red(`No target label was found on pr #${prNumber}`));
    process.exitCode = 1;
    return;
  }
  /** The target branches based on the target label and branch targetted in the Github UI. */
  const targets = await getBranchesFromTargetLabel(targetLabel, githubTargetBranch);

  // When requested, print a json output to stdout, rather than using standard ng-dev logging.
  if (jsonOutput) {
    process.stdout.write(JSON.stringify(targets));
    return;
  }

  info.group(`PR #${prNumber} will merge into:`);
  targets.forEach(target => info(`- ${target}`));
  info.groupEnd();
}
