/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getConfig} from '../../utils/config';
import {error, info, red} from '../../utils/console';
import {GitClient} from '../../utils/git/git-client';
import {loadAndValidateConfig, TargetLabel} from '../merge/config';
import {getBranchesFromTargetLabel, getTargetLabelFromPullRequest, InvalidTargetLabelError} from '../merge/target-label';

export async function getTargetBranchesForPr(prNumber: number) {
  /** The ng-dev configuration. */
  const config = getConfig();
  /** Repo owner and name for the github repository. */
  const {owner, name: repo} = config.github;
  /** The singleton instance of the GitClient. */
  const git = GitClient.get();
  /** The validated merge config. */
  const {config: mergeConfig, errors} = await loadAndValidateConfig(config, git.github);
  if (errors !== undefined) {
    throw Error(`Invalid configuration found: ${errors}`);
  }
  /** The current state of the pull request from Github. */
  const prData = (await git.github.pulls.get({owner, repo, pull_number: prNumber})).data;
  /** The list of labels on the PR as strings. */
  // Note: The `name` property of labels is always set but the Github OpenAPI spec is incorrect
  // here.
  // TODO(devversion): Remove the non-null cast once
  // https://github.com/github/rest-api-description/issues/169 is fixed.
  const labels = prData.labels.map(l => l.name!);
  /** The branch targetted via the Github UI. */
  const githubTargetBranch = prData.base.ref;
  /** The active label which is being used for targetting the PR. */
  let targetLabel: TargetLabel;

  try {
    targetLabel = getTargetLabelFromPullRequest(mergeConfig!, labels);
  } catch (e) {
    if (e instanceof InvalidTargetLabelError) {
      error(red(e.failureMessage));
      process.exitCode = 1;
      return;
    }
    throw e;
  }
  /** The target branches based on the target label and branch targetted in the Github UI. */
  return await getBranchesFromTargetLabel(targetLabel, githubTargetBranch);
}


export async function printTargetBranchesForPr(prNumber: number) {
  const targets = await getTargetBranchesForPr(prNumber);
  if (targets === undefined) {
    return;
  }
  info.group(`PR #${prNumber} will merge into:`);
  targets.forEach(target => info(`- ${target}`));
  info.groupEnd();
}
