/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {types as graphQLTypes} from 'typed-graphqlify';
import {URL} from 'url';

import {getConfig, NgDevConfig} from '../../utils/config';
import {error, info, promptConfirm} from '../../utils/console';
import {GitClient} from '../../utils/git';
import {getPr} from '../../utils/github';
import {exec} from '../../utils/shelljs';

/* GraphQL schema for the response body for each pending PR. */
const PR_SCHEMA = {
  state: graphQLTypes.string,
  maintainerCanModify: graphQLTypes.boolean,
  viewerDidAuthor: graphQLTypes.boolean,
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
    prNumber: number, githubToken: string, config: Pick<NgDevConfig, 'github'> = getConfig()) {
  const git = new GitClient();
  // TODO: Rely on a common assertNoLocalChanges function.
  if (git.hasLocalChanges()) {
    error('Cannot perform rebase of PR with local changes.');
    process.exit(1);
  }

  /**
   * The branch originally checked out before this method performs any Git
   * operations that may change the working branch.
   */
  const originalBranch = git.getCurrentBranch();
  /* Get the PR information from Github. */
  const pr = await getPr(PR_SCHEMA, prNumber, config.github);

  const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${pr.headRef.name}`;
  const fullBaseRef = `${pr.baseRef.repository.nameWithOwner}:${pr.baseRef.name}`;
  const headRefUrl = addAuthenticationToUrl(pr.headRef.repository.url, githubToken);
  const baseRefUrl = addAuthenticationToUrl(pr.baseRef.repository.url, githubToken);

  // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
  // be pushed up.
  if (!pr.maintainerCanModify && !pr.viewerDidAuthor) {
    error(
        `Cannot rebase as you did not author the PR and the PR does not allow maintainers` +
        `to modify the PR`);
    process.exit(1);
  }

  try {
    // Fetch the branch at the commit of the PR, and check it out in a detached state.
    info(`Checking out PR #${prNumber} from ${fullHeadRef}`);
    exec(`git fetch ${headRefUrl} ${pr.headRef.name}`);
    exec(`git checkout --detach FETCH_HEAD`);

    // Fetch the PRs target branch and rebase onto it.
    info(`Fetching ${fullBaseRef} to rebase #${prNumber} on`);
    exec(`git fetch ${baseRefUrl} ${pr.baseRef.name}`);
    info(`Attempting to rebase PR #${prNumber} on ${fullBaseRef}`);
    const rebaseResult = exec(`git rebase FETCH_HEAD`);

    // If the rebase was clean, push the rebased PR up to the authors fork.
    if (rebaseResult.code === 0) {
      info(`Rebase was able to complete automatically without conflicts`);
      info(`Pushing rebased PR #${prNumber} to ${fullHeadRef}`);
      exec(`git push ${baseRefUrl} HEAD:${pr.baseRef.name} --force-with-lease`);
      info(`Rebased and updated PR #${prNumber}`);
      cleanUpGitState();
      process.exit(0);
    }
  } catch (err) {
    error(err.message);
    cleanUpGitState();
    process.exit(1);
  }

  // On automatic rebase failures, prompt to choose if the rebase should be continued
  // manually or aborted now.
  info(`Rebase was unable to complete automatically without conflicts.`);
  // If the command is run in a non-CI environment, prompt to format the files immediately.
  const continueRebase =
      process.env['CI'] === undefined && await promptConfirm('Manually complete rebase?');

  if (continueRebase) {
    info(`After manually completing rebase, run the following command to update PR #${prNumber}:`);
    info(` $ git push ${pr.baseRef.repository.url} HEAD:${pr.baseRef.name} --force-with-lease`);
    info();
    info(`To abort the rebase and return to the state of the repository before this command`);
    info(`run the following command:`);
    info(` $ git rebase --abort && git reset --hard && git checkout ${originalBranch}`);
    process.exit(1);
  } else {
    info(`Cleaning up git state, and restoring previous state.`);
  }

  cleanUpGitState();
  process.exit(1);

  /** Reset git back to the original branch. */
  function cleanUpGitState() {
    // Ensure that any outstanding rebases are aborted.
    exec(`git rebase --abort`);
    // Ensure that any changes in the current repo state are cleared.
    exec(`git reset --hard`);
    // Checkout the original branch from before the run began.
    exec(`git checkout ${originalBranch}`);
  }
}

/** Adds the provided token as username to the provided url. */
function addAuthenticationToUrl(urlString: string, token: string) {
  const url = new URL(urlString);
  url.username = token;
  return url.toString();
}
