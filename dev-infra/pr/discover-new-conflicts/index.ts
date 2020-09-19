/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Bar} from 'cli-progress';
import {types as graphQLTypes} from 'typed-graphqlify';

import {getConfig, NgDevConfig} from '../../utils/config';
import {error, info} from '../../utils/console';
import {GitClient} from '../../utils/git/index';
import {getPendingPrs} from '../../utils/github';
import {exec} from '../../utils/shelljs';


/* GraphQL schema for the response body for each pending PR. */
const PR_SCHEMA = {
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
  updatedAt: graphQLTypes.string,
  number: graphQLTypes.number,
  mergeable: graphQLTypes.string,
  title: graphQLTypes.string,
};

/* Pull Request response from Github GraphQL query */
type RawPullRequest = typeof PR_SCHEMA;

/** Convert raw Pull Request response from Github to usable Pull Request object. */
function processPr(pr: RawPullRequest) {
  return {...pr, updatedAt: (new Date(pr.updatedAt)).getTime()};
}

/* Pull Request object after processing, derived from the return type of the processPr function. */
type PullRequest = ReturnType<typeof processPr>;

/** Name of a temporary local branch that is used for checking conflicts. **/
const tempWorkingBranch = '__NgDevRepoBaseAfterChange__';

/** Checks if the provided PR will cause new conflicts in other pending PRs. */
export async function discoverNewConflictsForPr(
    newPrNumber: number, updatedAfter: number, config: Pick<NgDevConfig, 'github'> = getConfig()) {
  const git = new GitClient();
  // If there are any local changes in the current repository state, the
  // check cannot run as it needs to move between branches.
  if (git.hasLocalChanges()) {
    error('Cannot run with local changes. Please make sure there are no local changes.');
    process.exit(1);
  }

  /** The active github branch or revision before we performed any Git commands. */
  const previousBranchOrRevision = git.getCurrentBranchOrRevision();
  /* Progress bar to indicate progress. */
  const progressBar = new Bar({format: `[{bar}] ETA: {eta}s | {value}/{total}`});
  /* PRs which were found to be conflicting. */
  const conflicts: Array<PullRequest> = [];

  info(`Requesting pending PRs from Github`);
  /** List of PRs from github currently known as mergable. */
  const allPendingPRs = (await getPendingPrs(PR_SCHEMA, git)).map(processPr);
  /** The PR which is being checked against. */
  const requestedPr = allPendingPRs.find(pr => pr.number === newPrNumber);
  if (requestedPr === undefined) {
    error(
        `The request PR, #${newPrNumber} was not found as a pending PR on github, please confirm`);
    error(`the PR number is correct and is an open PR`);
    process.exit(1);
  }

  const pendingPrs = allPendingPRs.filter(pr => {
    return (
        // PRs being merged into the same target branch as the requested PR
        pr.baseRef.name === requestedPr.baseRef.name &&
        // PRs which either have not been processed or are determined as mergable by Github
        pr.mergeable !== 'CONFLICTING' &&
        // PRs updated after the provided date
        pr.updatedAt >= updatedAfter);
  });
  info(`Retrieved ${allPendingPRs.length} total pending PRs`);
  info(`Checking ${pendingPrs.length} PRs for conflicts after a merge of #${newPrNumber}`);

  // Fetch and checkout the PR being checked.
  exec(`git fetch ${requestedPr.headRef.repository.url} ${requestedPr.headRef.name}`);
  exec(`git checkout -B ${tempWorkingBranch} FETCH_HEAD`);

  // Rebase the PR against the PRs target branch.
  exec(`git fetch ${requestedPr.baseRef.repository.url} ${requestedPr.baseRef.name}`);
  const result = exec(`git rebase FETCH_HEAD`);
  if (result.code) {
    error('The requested PR currently has conflicts');
    cleanUpGitState(previousBranchOrRevision);
    process.exit(1);
  }

  // Start the progress bar
  progressBar.start(pendingPrs.length, 0);

  // Check each PR to determine if it can merge cleanly into the repo after the target PR.
  for (const pr of pendingPrs) {
    // Fetch and checkout the next PR
    exec(`git fetch ${pr.headRef.repository.url} ${pr.headRef.name}`);
    exec(`git checkout --detach FETCH_HEAD`);
    // Check if the PR cleanly rebases into the repo after the target PR.
    const result = exec(`git rebase ${tempWorkingBranch}`);
    if (result.code !== 0) {
      conflicts.push(pr);
    }
    // Abort any outstanding rebase attempt.
    exec(`git rebase --abort`);

    progressBar.increment(1);
  }
  // End the progress bar as all PRs have been processed.
  progressBar.stop();
  info();
  info(`Result:`);

  cleanUpGitState(previousBranchOrRevision);

  // If no conflicts are found, exit successfully.
  if (conflicts.length === 0) {
    info(`No new conflicting PRs found after #${newPrNumber} merging`);
    process.exit(0);
  }

  // Inform about discovered conflicts, exit with failure.
  error.group(`${conflicts.length} PR(s) which conflict(s) after #${newPrNumber} merges:`);
  for (const pr of conflicts) {
    error(`  - #${pr.number}: ${pr.title}`);
  }
  error.groupEnd();
  process.exit(1);
}

/** Reset git back to the provided branch or revision. */
export function cleanUpGitState(previousBranchOrRevision: string) {
  // Ensure that any outstanding rebases are aborted.
  exec(`git rebase --abort`);
  // Ensure that any changes in the current repo state are cleared.
  exec(`git reset --hard`);
  // Checkout the original branch from before the run began.
  exec(`git checkout ${previousBranchOrRevision}`);
  // Delete the generated branch.
  exec(`git branch -D ${tempWorkingBranch}`);
}
