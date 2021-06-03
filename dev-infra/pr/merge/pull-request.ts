/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {params, types as graphqlTypes} from 'typed-graphqlify';

import {Commit, parseCommitMessage} from '../../commit-message/parse';
import {red, warn} from '../../utils/console';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {getPr} from '../../utils/github';

import {MergeConfig, TargetLabel} from './config';
import {PullRequestFailure} from './failures';
import {matchesPattern} from './string-pattern';
import {getBranchesFromTargetLabel, getTargetLabelFromPullRequest, InvalidTargetBranchError, InvalidTargetLabelError} from './target-label';
import {PullRequestMergeTask} from './task';

/** The default label for labeling pull requests containing a breaking change. */
const BreakingChangeLabel = 'breaking changes';

/** Interface that describes a pull request. */
export interface PullRequest {
  /** URL to the pull request. */
  url: string;
  /** Number of the pull request. */
  prNumber: number;
  /** Title of the pull request. */
  title: string;
  /** Labels applied to the pull request. */
  labels: string[];
  /** List of branches this PR should be merged into. */
  targetBranches: string[];
  /** Branch that the PR targets in the Github UI. */
  githubTargetBranch: string;
  /** Count of commits in this pull request. */
  commitCount: number;
  /** Optional SHA that this pull request needs to be based on. */
  requiredBaseSha?: string;
  /** Whether the pull request commit message fixup. */
  needsCommitMessageFixup: boolean;
  /** Whether the pull request has a caretaker note. */
  hasCaretakerNote: boolean;
}

/**
 * Loads and validates the specified pull request against the given configuration.
 * If the pull requests fails, a pull request failure is returned.
 */
export async function loadAndValidatePullRequest(
    {git, config}: PullRequestMergeTask, prNumber: number,
    ignoreNonFatalFailures = false): Promise<PullRequest|PullRequestFailure> {
  const prData = await fetchPullRequestFromGithub(git, prNumber);

  if (prData === null) {
    return PullRequestFailure.notFound();
  }

  const labels = prData.labels.nodes.map(l => l.name);

  if (!labels.some(name => matchesPattern(name, config.mergeReadyLabel))) {
    return PullRequestFailure.notMergeReady();
  }
  if (!labels.some(name => matchesPattern(name, config.claSignedLabel))) {
    return PullRequestFailure.claUnsigned();
  }

  let targetLabel: TargetLabel;
  try {
    targetLabel = getTargetLabelFromPullRequest(config, labels);
  } catch (error) {
    if (error instanceof InvalidTargetLabelError) {
      return new PullRequestFailure(error.failureMessage);
    }
    throw error;
  }

  /** List of parsed commits for all of the commits in the pull request. */
  const commitsInPr = prData.commits.nodes.map(n => parseCommitMessage(n.commit.message));

  try {
    assertPendingState(prData);
    assertChangesAllowForTargetLabel(commitsInPr, targetLabel, config);
    assertCorrectBreakingChangeLabeling(commitsInPr, labels, config);
  } catch (error) {
    return error;
  }

  /** The combined status of the latest commit in the pull request. */
  const state = prData.commits.nodes.slice(-1)[0].commit.status.state;
  if (state === 'FAILURE' && !ignoreNonFatalFailures) {
    return PullRequestFailure.failingCiJobs();
  }
  if (state === 'PENDING' && !ignoreNonFatalFailures) {
    return PullRequestFailure.pendingCiJobs();
  }

  const githubTargetBranch = prData.baseRefName;
  const requiredBaseSha =
      config.requiredBaseCommits && config.requiredBaseCommits[githubTargetBranch];
  const needsCommitMessageFixup = !!config.commitMessageFixupLabel &&
      labels.some(name => matchesPattern(name, config.commitMessageFixupLabel));
  const hasCaretakerNote = !!config.caretakerNoteLabel &&
      labels.some(name => matchesPattern(name, config.caretakerNoteLabel!));
  let targetBranches: string[];

  // If branches are determined for a given target label, capture errors that are
  // thrown as part of branch computation. This is expected because a merge configuration
  // can lazily compute branches for a target label and throw. e.g. if an invalid target
  // label is applied, we want to exit the script gracefully with an error message.
  try {
    targetBranches = await getBranchesFromTargetLabel(targetLabel, githubTargetBranch);
  } catch (error) {
    if (error instanceof InvalidTargetBranchError || error instanceof InvalidTargetLabelError) {
      return new PullRequestFailure(error.failureMessage);
    }
    throw error;
  }

  return {
    url: prData.url,
    prNumber,
    labels,
    requiredBaseSha,
    githubTargetBranch,
    needsCommitMessageFixup,
    hasCaretakerNote,
    targetBranches,
    title: prData.title,
    commitCount: prData.commits.totalCount,
  };
}

/* Graphql schema for the response body the requested pull request. */
const PR_SCHEMA = {
  url: graphqlTypes.string,
  isDraft: graphqlTypes.boolean,
  state: graphqlTypes.oneOf(['OPEN', 'MERGED', 'CLOSED'] as const),
  number: graphqlTypes.number,
  // Only the last 100 commits from a pull request are obtained as we likely will never see a pull
  // requests with more than 100 commits.
  commits: params({last: 100}, {
    totalCount: graphqlTypes.number,
    nodes: [{
      commit: {
        status: {
          state: graphqlTypes.oneOf(['FAILURE', 'PENDING', 'SUCCESS'] as const),
        },
        message: graphqlTypes.string,
      },
    }],
  }),
  baseRefName: graphqlTypes.string,
  title: graphqlTypes.string,
  labels: params({first: 100}, {
    nodes: [{
      name: graphqlTypes.string,
    }]
  }),
};

/** A pull request retrieved from github via the graphql API. */
type RawPullRequest = typeof PR_SCHEMA;


/** Fetches a pull request from Github. Returns null if an error occurred. */
async function fetchPullRequestFromGithub(
    git: AuthenticatedGitClient, prNumber: number): Promise<RawPullRequest|null> {
  try {
    return await getPr(PR_SCHEMA, prNumber, git);
  } catch (e) {
    // If the pull request could not be found, we want to return `null` so
    // that the error can be handled gracefully.
    if (e.status === 404) {
      return null;
    }
    throw e;
  }
}

/** Whether the specified value resolves to a pull request. */
export function isPullRequest(v: PullRequestFailure|PullRequest): v is PullRequest {
  return (v as PullRequest).targetBranches !== undefined;
}

/**
 * Assert the commits provided are allowed to merge to the provided target label,
 * throwing an error otherwise.
 * @throws {PullRequestFailure}
 */
function assertChangesAllowForTargetLabel(
    commits: Commit[], label: TargetLabel, config: MergeConfig) {
  /**
   * List of commit scopes which are exempted from target label content requirements. i.e. no `feat`
   * scopes in patch branches, no breaking changes in minor or patch changes.
   */
  const exemptedScopes = config.targetLabelExemptScopes || [];
  /** List of commits which are subject to content requirements for the target label. */
  commits = commits.filter(commit => !exemptedScopes.includes(commit.scope));
  const hasBreakingChanges = commits.some(commit => commit.breakingChanges.length !== 0);
  const hasDeprecations = commits.some(commit => commit.deprecations.length !== 0);
  const hasFeatureCommits = commits.some(commit => commit.type === 'feat');
  switch (label.pattern) {
    case 'target: major':
      break;
    case 'target: minor':
      if (hasBreakingChanges) {
        throw PullRequestFailure.hasBreakingChanges(label);
      }
      break;
    case 'target: rc':
    case 'target: patch':
    case 'target: lts':
      if (hasBreakingChanges) {
        throw PullRequestFailure.hasBreakingChanges(label);
      }
      if (hasFeatureCommits) {
        throw PullRequestFailure.hasFeatureCommits(label);
      }
      // Deprecations should not be merged into RC, patch or LTS branches.
      // https://semver.org/#spec-item-7. Deprecations should be part of
      // minor releases, or major releases according to SemVer.
      if (hasDeprecations) {
        throw PullRequestFailure.hasDeprecations(label);
      }
      break;
    default:
      warn(red('WARNING: Unable to confirm all commits in the pull request are eligible to be'));
      warn(red(`merged into the target branch: ${label.pattern}`));
      break;
  }
}

/**
 * Assert the pull request has the proper label for breaking changes if there are breaking change
 * commits, and only has the label if there are breaking change commits.
 * @throws {PullRequestFailure}
 */
function assertCorrectBreakingChangeLabeling(
    commits: Commit[], labels: string[], config: MergeConfig) {
  /** Whether the PR has a label noting a breaking change. */
  const hasLabel = labels.includes(config.breakingChangeLabel || BreakingChangeLabel);
  //** Whether the PR has at least one commit which notes a breaking change. */
  const hasCommit = commits.some(commit => commit.breakingChanges.length !== 0);

  if (!hasLabel && hasCommit) {
    throw PullRequestFailure.missingBreakingChangeLabel();
  }

  if (hasLabel && !hasCommit) {
    throw PullRequestFailure.missingBreakingChangeCommit();
  }
}


/**
 * Assert the pull request is pending, not closed, merged or in draft.
 * @throws {PullRequestFailure} if the pull request is not pending.
 */
function assertPendingState(pr: RawPullRequest) {
  if (pr.isDraft) {
    throw PullRequestFailure.isDraft();
  }
  switch (pr.state) {
    case 'CLOSED':
      throw PullRequestFailure.isClosed();
    case 'MERGED':
      throw PullRequestFailure.isMerged();
  }
}
