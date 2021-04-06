/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {params, types as graphQLTypes} from 'typed-graphqlify';
import {parseCommitMessage} from '../../commit-message/parse';
import {red, warn} from '../../utils/console';

import {GitClient} from '../../utils/git/index';
import {getPr} from '../../utils/github';
import {TargetLabel} from './config';

import {PullRequestFailure} from './failures';
import {matchesPattern} from './string-pattern';
import {getBranchesFromTargetLabel, getTargetLabelFromPullRequest, InvalidTargetBranchError, InvalidTargetLabelError} from './target-label';
import {PullRequestMergeTask} from './task';

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

  try {
    assertCorrectTargetForChanges(prData.commits.nodes.map(n => n.commit.message), targetLabel);
  } catch (error) {
    return error;
  }

  const state = prData.commits.nodes.slice(-1)[0].commit.status.state;
  if (state === 'FAILURE' && !ignoreNonFatalFailures) {
    return PullRequestFailure.failingCiJobs();
  }
  if (state === 'PENDING' && !ignoreNonFatalFailures) {
    return PullRequestFailure.pendingCiJobs();
  }

  const githubTargetBranch = prData.baseRefOid;
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
    commitCount: prData.commits.nodes.length,
  };
}

/* GraphQL schema for the response body the requested PR. */
const PR_SCHEMA = {
  url: graphQLTypes.string,
  number: graphQLTypes.number,
  commits: params({first: 100}, {
    nodes: [{
      commit: {
        status: {
          state: graphQLTypes.oneOf(['FAILURE', 'PENDING', 'SUCCESS'] as const),
        },
        message: graphQLTypes.string,
      },
    }],
  }),
  baseRefOid: graphQLTypes.string,
  title: graphQLTypes.string,
  labels: params({first: 100}, {
    nodes: [{
      name: graphQLTypes.string,
    }]
  }),
};



/** Fetches a pull request from Github. Returns null if an error occurred. */
async function fetchPullRequestFromGithub(
    git: GitClient, prNumber: number): Promise<typeof PR_SCHEMA|null> {
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
 * Assert the commits provided are allowed to merge to the provided target label, throwing a
 * PullRequestFailure otherwise.
 */
function assertCorrectTargetForChanges(rawCommits: string[], label: TargetLabel) {
  /** List of ParsedCommits for all of the commits in the pull request. */
  const commits = rawCommits.map(parseCommitMessage);
  switch (label.pattern) {
    case 'target: major':
      break;
    case 'target: minor':
      // Check if any commits in the PR contains a breaking change.
      if (commits.some(commit => commit.breakingChanges.length !== 0)) {
        throw PullRequestFailure.hasBreakingChanges(label);
      }
      break;
    case 'target: patch':
    case 'target: lts':
      // Check if any commits in the PR contains a breaking change.
      if (commits.some(commit => commit.breakingChanges.length !== 0)) {
        throw PullRequestFailure.hasBreakingChanges(label);
      }
      // Check if any commits in the PR contains a commit type of "feat".
      if (commits.some(commit => commit.type === 'feat')) {
        throw PullRequestFailure.hasFeatureCommits(label);
      }
      break;
    default:
      warn(red('WARNING: Unable to confirm all commits in the PR are eligible to be merged'));
      warn(red(`into the target branch: ${label.pattern}`));
      break;
  }
}
