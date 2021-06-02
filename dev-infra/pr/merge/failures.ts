/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetLabel} from './config';

/**
 * Class that can be used to describe pull request failures. A failure
 * is described through a human-readable message and a flag indicating
 * whether it is non-fatal or not.
 */
export class PullRequestFailure {
  constructor(
      /** Human-readable message for the failure */
      public message: string,
      /** Whether the failure is non-fatal and can be forcibly ignored. */
      public nonFatal = false) {}

  static claUnsigned() {
    return new this(`CLA has not been signed. Please make sure the PR author has signed the CLA.`);
  }

  static failingCiJobs() {
    return new this(`Failing CI jobs.`, true);
  }

  static pendingCiJobs() {
    return new this(`Pending CI jobs.`, true);
  }

  static notMergeReady() {
    return new this(`Not marked as merge ready.`);
  }

  static isDraft() {
    return new this('Pull request is still in draft.');
  }

  static isClosed() {
    return new this('Pull request is already closed.');
  }

  static isMerged() {
    return new this('Pull request is already merged.');
  }

  static mismatchingTargetBranch(allowedBranches: string[]) {
    return new this(
        `Pull request is set to wrong base branch. Please update the PR in the Github UI ` +
        `to one of the following branches: ${allowedBranches.join(', ')}.`);
  }

  static unsatisfiedBaseSha() {
    return new this(
        `Pull request has not been rebased recently and could be bypassing CI checks. ` +
        `Please rebase the PR.`);
  }

  static mergeConflicts(failedBranches: string[]) {
    return new this(
        `Could not merge pull request into the following branches due to merge ` +
        `conflicts: ${
            failedBranches.join(', ')}. Please rebase the PR or update the target label.`);
  }

  static unknownMergeError() {
    return new this(`Unknown merge error occurred. Please see console output above for debugging.`);
  }

  static unableToFixupCommitMessageSquashOnly() {
    return new this(
        `Unable to fixup commit message of pull request. Commit message can only be ` +
        `modified if the PR is merged using squash.`);
  }

  static notFound() {
    return new this(`Pull request could not be found upstream.`);
  }

  static insufficientPermissionsToMerge(
      message = `Insufficient Github API permissions to merge pull request. Please ensure that ` +
          `your auth token has write access.`) {
    return new this(message);
  }

  static hasBreakingChanges(label: TargetLabel) {
    const message = `Cannot merge into branch for "${label.pattern}" as the pull request has ` +
        `breaking changes. Breaking changes can only be merged with the "target: major" label.`;
    return new this(message);
  }

  static hasDeprecations(label: TargetLabel) {
    const message = `Cannot merge into branch for "${label.pattern}" as the pull request ` +
        `contains deprecations. Deprecations can only be merged with the "target: minor" or ` +
        `"target: major" label.`;
    return new this(message);
  }

  static hasFeatureCommits(label: TargetLabel) {
    const message = `Cannot merge into branch for "${label.pattern}" as the pull request has ` +
        'commits with the "feat" type. New features can only be merged with the "target: minor" ' +
        'or "target: major" label.';
    return new this(message);
  }

  static missingBreakingChangeLabel() {
    const message = 'Pull Request has at least one commit containing a breaking change note, but ' +
        'does not have a breaking change label.';
    return new this(message);
  }

  static missingBreakingChangeCommit() {
    const message = 'Pull Request has a breaking change label, but does not contain any commits ' +
        'with breaking change notes.';
    return new this(message);
  }
}
