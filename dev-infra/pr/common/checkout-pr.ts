/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {types as graphqlTypes} from 'typed-graphqlify';

import {info} from '../../utils/console';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {addTokenToGitHttpsUrl} from '../../utils/git/github-urls';
import {getPr} from '../../utils/github';

/* Graphql schema for the response body for a pending PR. */
const PR_SCHEMA = {
  state: graphqlTypes.string,
  maintainerCanModify: graphqlTypes.boolean,
  viewerDidAuthor: graphqlTypes.boolean,
  headRefOid: graphqlTypes.string,
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
};


export class UnexpectedLocalChangesError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, UnexpectedLocalChangesError.prototype);
  }
}

export class MaintainerModifyAccessError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, MaintainerModifyAccessError.prototype);
  }
}

/** Options for checking out a PR */
export interface PullRequestCheckoutOptions {
  /** Whether the PR should be checked out if the maintainer cannot modify. */
  allowIfMaintainerCannotModify?: boolean;
}

/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 */
export async function checkOutPullRequestLocally(
    prNumber: number, githubToken: string, opts: PullRequestCheckoutOptions = {}) {
  /** The singleton instance of the authenticated git client. */
  const git = AuthenticatedGitClient.get();

  // In order to preserve local changes, checkouts cannot occur if local changes are present in the
  // git environment. Checked before retrieving the PR to fail fast.
  if (git.hasUncommittedChanges()) {
    throw new UnexpectedLocalChangesError('Unable to checkout PR due to uncommitted changes.');
  }

  /**
   * The branch or revision originally checked out before this method performed
   * any Git operations that may change the working branch.
   */
  const previousBranchOrRevision = git.getCurrentBranchOrRevision();
  /* The PR information from Github. */
  const pr = await getPr(PR_SCHEMA, prNumber, git);
  /** The branch name of the PR from the repository the PR came from. */
  const headRefName = pr.headRef.name;
  /** The full ref for the repository and branch the PR came from. */
  const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${headRefName}`;
  /** The full URL path of the repository the PR came from with github token as authentication. */
  const headRefUrl = addTokenToGitHttpsUrl(pr.headRef.repository.url, githubToken);
  // Note: Since we use a detached head for rebasing the PR and therefore do not have
  // remote-tracking branches configured, we need to set our expected ref and SHA. This
  // allows us to use `--force-with-lease` for the detached head while ensuring that we
  // never accidentally override upstream changes that have been pushed in the meanwhile.
  // See:
  // https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-leaseltrefnamegtltexpectgt
  /** Flag for a force push with lease back to upstream. */
  const forceWithLeaseFlag = `--force-with-lease=${headRefName}:${pr.headRefOid}`;

  // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
  // be pushed up.
  if (!pr.maintainerCanModify && !pr.viewerDidAuthor && !opts.allowIfMaintainerCannotModify) {
    throw new MaintainerModifyAccessError('PR is not set to allow maintainers to modify the PR');
  }

  try {
    // Fetch the branch at the commit of the PR, and check it out in a detached state.
    info(`Checking out PR #${prNumber} from ${fullHeadRef}`);
    git.run(['fetch', '-q', headRefUrl, headRefName]);
    git.run(['checkout', '--detach', 'FETCH_HEAD']);
  } catch (e) {
    git.checkout(previousBranchOrRevision, true);
    throw e;
  }

  return {
    /**
     * Pushes the current local branch to the PR on the upstream repository.
     *
     * @returns true If the command did not fail causing a GitCommandError to be thrown.
     * @throws GitCommandError Thrown when the push back to upstream fails.
     */
    pushToUpstream: (): true => {
      git.run(['push', headRefUrl, `HEAD:${headRefName}`, forceWithLeaseFlag]);
      return true;
    },
    /** Restores the state of the local repository to before the PR checkout occured. */
    resetGitState: (): boolean => {
      return git.checkout(previousBranchOrRevision, true);
    }
  };
}
