/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '../../../utils/git/index';
import {PullRequestFailure} from '../failures';
import {PullRequest} from '../pull-request';

/**
 * Name of a temporary branch that contains the head of a currently-processed PR. Note
 * that a branch name should be used that most likely does not conflict with other local
 * development branches.
 */
export const TEMP_PR_HEAD_BRANCH = 'merge_pr_head';

/**
 * Base class for merge strategies. A merge strategy accepts a pull request and
 * merges it into the determined target branches.
 */
export abstract class MergeStrategy {
  constructor(protected git: GitClient) {}

  /**
   * Prepares a merge of the given pull request. The strategy by default will
   * fetch all target branches and the pull request into local temporary branches.
   */
  async prepare(pullRequest: PullRequest) {
    this.fetchTargetBranches(
        pullRequest.targetBranches, `pull/${pullRequest.prNumber}/head:${TEMP_PR_HEAD_BRANCH}`);
  }

  /**
   * Performs the merge of the given pull request. This needs to be implemented
   * by individual merge strategies.
   */
  abstract merge(pullRequest: PullRequest): Promise<null|PullRequestFailure>;

  /** Cleans up the pull request merge. e.g. deleting temporary local branches. */
  async cleanup(pullRequest: PullRequest) {
    // Delete all temporary target branches.
    pullRequest.targetBranches.forEach(
        branchName => this.git.run(['branch', '-D', this.getLocalTargetBranchName(branchName)]));

    // Delete temporary branch for the pull request head.
    this.git.run(['branch', '-D', TEMP_PR_HEAD_BRANCH]);
  }

  /** Gets the revision range for all commits in the given pull request. */
  protected getPullRequestRevisionRange(pullRequest: PullRequest): string {
    return `${this.getPullRequestBaseRevision(pullRequest)}..${TEMP_PR_HEAD_BRANCH}`;
  }

  /** Gets the base revision of a pull request. i.e. the commit the PR is based on. */
  protected getPullRequestBaseRevision(pullRequest: PullRequest): string {
    return `${TEMP_PR_HEAD_BRANCH}~${pullRequest.commitCount}`;
  }

  /** Gets a deterministic local branch name for a given branch. */
  protected getLocalTargetBranchName(targetBranch: string): string {
    return `merge_pr_target_${targetBranch.replace(/\//g, '_')}`;
  }

  /**
   * Cherry-picks the given revision range into the specified target branches.
   * @returns A list of branches for which the revisions could not be cherry-picked into.
   */
  protected cherryPickIntoTargetBranches(revisionRange: string, targetBranches: string[], options: {
    dryRun?: boolean,
    linkToOriginalCommits?: boolean,
  } = {}) {
    const cherryPickArgs = [revisionRange];
    const failedBranches: string[] = [];

    if (options.dryRun) {
      // https://git-scm.com/docs/git-cherry-pick#Documentation/git-cherry-pick.txt---no-commit
      // This causes `git cherry-pick` to not generate any commits. Instead, the changes are
      // applied directly in the working tree. This allow us to easily discard the changes
      // for dry-run purposes.
      cherryPickArgs.push('--no-commit');
    }

    if (options.linkToOriginalCommits) {
      // We add `-x` when cherry-picking as that will allow us to easily jump to original
      // commits for cherry-picked commits. With that flag set, Git will automatically append
      // the original SHA/revision to the commit message. e.g. `(cherry picked from commit <..>)`.
      // https://git-scm.com/docs/git-cherry-pick#Documentation/git-cherry-pick.txt--x.
      cherryPickArgs.push('-x');
    }

    // Cherry-pick the refspec into all determined target branches.
    for (const branchName of targetBranches) {
      const localTargetBranch = this.getLocalTargetBranchName(branchName);
      // Checkout the local target branch.
      this.git.run(['checkout', localTargetBranch]);
      // Cherry-pick the refspec into the target branch.
      if (this.git.runGraceful(['cherry-pick', ...cherryPickArgs]).status !== 0) {
        // Abort the failed cherry-pick. We do this because Git persists the failed
        // cherry-pick state globally in the repository. This could prevent future
        // pull request merges as a Git thinks a cherry-pick is still in progress.
        this.git.runGraceful(['cherry-pick', '--abort']);
        failedBranches.push(branchName);
      }
      // If we run with dry run mode, we reset the local target branch so that all dry-run
      // cherry-pick changes are discard. Changes are applied to the working tree and index.
      if (options.dryRun) {
        this.git.run(['reset', '--hard', 'HEAD']);
      }
    }
    return failedBranches;
  }

  /**
   * Fetches the given target branches. Also accepts a list of additional refspecs that
   * should be fetched. This is helpful as multiple slow fetches could be avoided.
   */
  protected fetchTargetBranches(names: string[], ...extraRefspecs: string[]) {
    const fetchRefspecs = names.map(targetBranch => {
      const localTargetBranch = this.getLocalTargetBranchName(targetBranch);
      return `refs/heads/${targetBranch}:${localTargetBranch}`;
    });
    // Fetch all target branches with a single command. We don't want to fetch them
    // individually as that could cause an unnecessary slow-down.
    this.git.run(['fetch', '-q', '-f', this.git.repoGitUrl, ...fetchRefspecs, ...extraRefspecs]);
  }

  /** Pushes the given target branches upstream. */
  protected pushTargetBranchesUpstream(names: string[]) {
    const pushRefspecs = names.map(targetBranch => {
      const localTargetBranch = this.getLocalTargetBranchName(targetBranch);
      return `${localTargetBranch}:refs/heads/${targetBranch}`;
    });
    // Push all target branches with a single command if we don't run in dry-run mode.
    // We don't want to push them individually as that could cause an unnecessary slow-down.
    this.git.run(['push', this.git.repoGitUrl, ...pushRefspecs]);
  }
}
