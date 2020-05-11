/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {prompt} from 'inquirer';
import {types as graphQLTypes} from 'typed-graphqlify';

import {getConfig, NgDevConfig} from '../utils/config';
import {getCurrentBranch, hasLocalChanges} from '../utils/git';
import {getPr} from '../utils/github';
import {exec} from '../utils/shelljs';

// GraphQL schema for the response body for each pending PR.
const PR_SCHEMA = {
  state: graphQLTypes.string,
  maintainerCanModify: graphQLTypes.boolean,
  headRef: {
    name: graphQLTypes.string,
    repository: {
      url: graphQLTypes.string,
      nameWithOwner: graphQLTypes.string,
    },
  },
  baseRef: {
    name: graphQLTypes.string,
    repository: {
      url: graphQLTypes.string,
      nameWithOwner: graphQLTypes.string,
    },
  },
};

/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 */
export async function rebasePr(
    prNumber: number, config: Pick<NgDevConfig, 'github'> = getConfig()) {
  if (hasLocalChanges()) {
    console.error('Cannot perform rebase of PR with local changes in your client.');
    process.exit(1);
  }

  // The branch checked out when the run started
  const originalBranch = getCurrentBranch();
  // Get the PR information from Github.
  const pr = await getPr(PR_SCHEMA, prNumber, config.github);

  // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
  // be pushed up.
  if (!pr.maintainerCanModify) {
    console.error(`Cannot rebase as PR does not allow maintainer to modify the PR`);
    process.exit(1);
  }

  try {
    const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${pr.headRef.name}`;
    const fullBaseRef = `${pr.baseRef.repository.nameWithOwner}:${pr.baseRef.name}`;
    // Fetch the branch at the commit of the PR, and check it out in a detached state.
    console.info(`Checking out PR #${prNumber} from ${fullHeadRef}`);
    exec(`git fetch ${pr.headRef.repository.url} ${pr.headRef.name}`);
    exec(`git checkout --detach FETCH_HEAD`);

    // Fetch the PRs target branch and rebase onto it.
    console.info(`Fetching ${fullBaseRef} to rebase #${prNumber} on`);
    exec(`git fetch ${pr.baseRef.repository.url} ${pr.baseRef.name}`);
    console.info(`Attempting to rebase PR #${prNumber} on ${fullBaseRef}`);
    const rebaseResult = exec(`git rebase FETCH_HEAD`);

    // If the rebase was clean, push the rebased PR up to the authors fork.
    if (rebaseResult.code === 0) {
      console.info(`Rebase was able to complete automatically without conflicts`);
      console.info(`Pushing rebased PR #${prNumber} to ${fullHeadRef}`);
      exec(`git push ${pr.baseRef.repository.url} HEAD:${pr.baseRef.name} --force-with-lease`);
      console.info(`Rebased and updated PR #${prNumber}`);
      cleanUpGitState(originalBranch);
      process.exit(0);
    }
  } catch (err) {
    console.error(err.message);
    cleanUpGitState(originalBranch);
    process.exit(1);
  }

  // On automatic rebase failures, prompt to choose if the rebase should be continued
  // manually or aborted now.
  console.info(`Rebase was unable to complete automatically without conflicts.`);
  const continueRebase: boolean = (await prompt({
                                    type: 'confirm',
                                    name: 'continueRebase',
                                    message: 'Manually complete rebase?',
                                  })).continueRebase;
  console.info();

  if (continueRebase) {
    console.info(
        `After manually completing rebase, run the following command to update PR #${prNumber}:`);
    console.info(
        ` $ git push ${pr.baseRef.repository.url} HEAD:${pr.baseRef.name} --force-with-lease`);
    console.info();
    console.info(
        `To abort the rebase and return to the state of the repository before this command`);
    console.info(`run the following command:`);
    console.info(` $ git rebase --abort && git reset --hard && git checkout ${originalBranch}`);
    process.exit(1);
  } else {
    console.info(`Cleaning up git state, and restoring previous state.`);
  }

  cleanUpGitState(originalBranch);
  process.exit(1);
}

/** Reset git back to the provided branch. */
export function cleanUpGitState(branch: string) {
  // Ensure that any outstanding rebases are aborted.
  exec(`git rebase --abort`);
  // Ensure that any changes in the current repo state are cleared.
  exec(`git reset --hard`);
  // Checkout the original branch from before the run began.
  exec(`git checkout ${branch}`);
}
