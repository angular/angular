/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {types as graphqlTypes} from 'typed-graphqlify';

import {Commit} from '../../commit-message/parse';
import {getCommitsInRange} from '../../commit-message/utils';
import {getConfig, NgDevConfig} from '../../utils/config';
import {error, info, promptConfirm} from '../../utils/console';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {addTokenToGitHttpsUrl} from '../../utils/git/github-urls';
import {getPr} from '../../utils/github';

/* Graphql schema for the response body for each pending PR. */
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

/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 */
export async function rebasePr(
    prNumber: number, githubToken: string, config: Pick<NgDevConfig, 'github'> = getConfig()) {
  /** The singleton instance of the authenticated git client. */
  const git = AuthenticatedGitClient.get();
  if (git.hasUncommittedChanges()) {
    error('Cannot perform rebase of PR with local changes.');
    process.exit(1);
  }

  /**
   * The branch or revision originally checked out before this method performed
   * any Git operations that may change the working branch.
   */
  const previousBranchOrRevision = git.getCurrentBranchOrRevision();
  /* Get the PR information from Github. */
  const pr = await getPr(PR_SCHEMA, prNumber, git);

  const headRefName = pr.headRef.name;
  const baseRefName = pr.baseRef.name;
  const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${headRefName}`;
  const fullBaseRef = `${pr.baseRef.repository.nameWithOwner}:${baseRefName}`;
  const headRefUrl = addTokenToGitHttpsUrl(pr.headRef.repository.url, githubToken);
  const baseRefUrl = addTokenToGitHttpsUrl(pr.baseRef.repository.url, githubToken);

  // Note: Since we use a detached head for rebasing the PR and therefore do not have
  // remote-tracking branches configured, we need to set our expected ref and SHA. This
  // allows us to use `--force-with-lease` for the detached head while ensuring that we
  // never accidentally override upstream changes that have been pushed in the meanwhile.
  // See:
  // https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-leaseltrefnamegtltexpectgt
  const forceWithLeaseFlag = `--force-with-lease=${headRefName}:${pr.headRefOid}`;

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
    git.run(['fetch', '-q', headRefUrl, headRefName]);
    git.run(['checkout', '-q', '--detach', 'FETCH_HEAD']);
    // Fetch the PRs target branch and rebase onto it.
    info(`Fetching ${fullBaseRef} to rebase #${prNumber} on`);
    git.run(['fetch', '-q', baseRefUrl, baseRefName]);

    const commonAncestorSha = git.run(['merge-base', 'HEAD', 'FETCH_HEAD']).stdout.trim();

    const commits = await getCommitsInRange(commonAncestorSha, 'HEAD');

    let squashFixups = commits.filter((commit: Commit) => commit.isFixup).length === 0 ?
        false :
        await promptConfirm(
            `PR #${prNumber} contains fixup commits, would you like to squash them during rebase?`,
            true);

    info(`Attempting to rebase PR #${prNumber} on ${fullBaseRef}`);

    /**
     * Tuple of flags to be added to the rebase command and env object to run the git command.
     *
     * Additional flags to perform the autosquashing are added when the user confirm squashing of
     * fixup commits should occur.
     */
    const [flags, env] = squashFixups ?
        [['--interactive', '--autosquash'], {...process.env, GIT_SEQUENCE_EDITOR: 'true'}] :
        [[], undefined];
    const rebaseResult = git.runGraceful(['rebase', ...flags, 'FETCH_HEAD'], {env: env});

    // If the rebase was clean, push the rebased PR up to the authors fork.
    if (rebaseResult.status === 0) {
      info(`Rebase was able to complete automatically without conflicts`);
      info(`Pushing rebased PR #${prNumber} to ${fullHeadRef}`);
      git.run(['push', headRefUrl, `HEAD:${headRefName}`, forceWithLeaseFlag]);
      info(`Rebased and updated PR #${prNumber}`);
      git.checkout(previousBranchOrRevision, true);
      process.exit(0);
    }
  } catch (err) {
    error(err.message);
    git.checkout(previousBranchOrRevision, true);
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
    info(` $ git push ${pr.headRef.repository.url} HEAD:${headRefName} ${forceWithLeaseFlag}`);
    info();
    info(`To abort the rebase and return to the state of the repository before this command`);
    info(`run the following command:`);
    info(` $ git rebase --abort && git reset --hard && git checkout ${previousBranchOrRevision}`);
    process.exit(1);
  } else {
    info(`Cleaning up git state, and restoring previous state.`);
  }

  git.checkout(previousBranchOrRevision, true);
  process.exit(1);
}
