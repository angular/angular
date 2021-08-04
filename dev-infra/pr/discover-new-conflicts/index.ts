/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Bar} from 'cli-progress';
import {types as graphqlTypes} from 'typed-graphqlify';

import {error, info} from '../../utils/console';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {GitCommandError} from '../../utils/git/git-client';
import {getPendingPrs} from '../../utils/github';


/* Graphql schema for the response body for each pending PR. */
const PR_SCHEMA = {
  headRef: {
    name: graphqlTypes.string,
    repository: {
      url: graphqlTypes.string,
      nameWithOwner: graphqlTypes.string,
    },
  },
  baseRef: {
    name: graphqlTypes.string,
    repository: {
      url: graphqlTypes.string,
      nameWithOwner: graphqlTypes.string,
    },
  },
  updatedAt: graphqlTypes.string,
  number: graphqlTypes.number,
  mergeable: graphqlTypes.string,
  title: graphqlTypes.string,
};

/* Pull Request response from Github Graphql query */
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
export async function discoverNewConflictsForPr(newPrNumber: number, updatedAfter: number) {
  /** The singleton instance of the authenticated git client. */
  const git = AuthenticatedGitClient.get();
  // If there are any local changes in the current repository state, the
  // check cannot run as it needs to move between branches.
  if (git.hasUncommittedChanges()) {
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
  /** List of PRs from github currently known as mergeable. */
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
        // PRs which either have not been processed or are determined as mergeable by Github
        pr.mergeable !== 'CONFLICTING' &&
        // PRs updated after the provided date
        pr.updatedAt >= updatedAfter);
  });
  info(`Retrieved ${allPendingPRs.length} total pending PRs`);
  info(`Checking ${pendingPrs.length} PRs for conflicts after a merge of #${newPrNumber}`);

  // Fetch and checkout the PR being checked.
  git.run(['fetch', '-q', requestedPr.headRef.repository.url, requestedPr.headRef.name]);
  git.run(['checkout', '-q', '-B', tempWorkingBranch, 'FETCH_HEAD']);

  // Rebase the PR against the PRs target branch.
  git.run(['fetch', '-q', requestedPr.baseRef.repository.url, requestedPr.baseRef.name]);
  try {
    git.run(['rebase', 'FETCH_HEAD'], {stdio: 'ignore'});
  } catch (err) {
    if (err instanceof GitCommandError) {
      error('The requested PR currently has conflicts');
      git.checkout(previousBranchOrRevision, true);
      process.exit(1);
    }
    throw err;
  }

  // Start the progress bar
  progressBar.start(pendingPrs.length, 0);

  // Check each PR to determine if it can merge cleanly into the repo after the target PR.
  for (const pr of pendingPrs) {
    // Fetch and checkout the next PR
    git.run(['fetch', '-q', pr.headRef.repository.url, pr.headRef.name]);
    git.run(['checkout', '-q', '--detach', 'FETCH_HEAD']);
    // Check if the PR cleanly rebases into the repo after the target PR.
    try {
      git.run(['rebase', tempWorkingBranch], {stdio: 'ignore'});
    } catch (err) {
      if (err instanceof GitCommandError) {
        conflicts.push(pr);
      } else {
        throw err;
      }
    }
    // Abort any outstanding rebase attempt.
    git.runGraceful(['rebase', '--abort'], {stdio: 'ignore'});

    progressBar.increment(1);
  }
  // End the progress bar as all PRs have been processed.
  progressBar.stop();
  info();
  info(`Result:`);

  git.checkout(previousBranchOrRevision, true);

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
