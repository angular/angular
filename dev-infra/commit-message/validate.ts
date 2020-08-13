/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {error} from '../utils/console';

import {COMMIT_TYPES, getCommitMessageConfig, ScopeRequirement} from './config';
import {parseCommitMessage} from './parse';

/** Options for commit message validation. */
export interface ValidateCommitMessageOptions {
  disallowSquash?: boolean;
  nonFixupCommitHeaders?: string[];
}

/** Regex matching a URL for an entire commit body line. */
const COMMIT_BODY_URL_LINE_RE = /^https?:\/\/.*$/;

/** Validate a commit message against using the local repo's config. */
export function validateCommitMessage(
    commitMsg: string, options: ValidateCommitMessageOptions = {}) {
  function printError(errorMessage: string) {
    error(
        `INVALID COMMIT MSG: \n` +
        `${'─'.repeat(40)}\n` +
        `${commitMsg}\n` +
        `${'─'.repeat(40)}\n` +
        `ERROR: \n` +
        `  ${errorMessage}` +
        `\n\n` +
        `The expected format for a commit is: \n` +
        `<type>(<scope>): <subject>\n\n<body>`);
  }

  const config = getCommitMessageConfig().commitMessage;
  const commit = parseCommitMessage(commitMsg);

  ////////////////////////////////////
  // Checking revert, squash, fixup //
  ////////////////////////////////////

  // All revert commits are considered valid.
  if (commit.isRevert) {
    return true;
  }

  // All squashes are considered valid, as the commit will be squashed into another in
  // the git history anyway, unless the options provided to not allow squash commits.
  if (commit.isSquash) {
    if (options.disallowSquash) {
      printError('The commit must be manually squashed into the target commit');
      return false;
    }
    return true;
  }

  // Fixups commits are considered valid, unless nonFixupCommitHeaders are provided to check
  // against. If `nonFixupCommitHeaders` is not empty, we check whether there is a corresponding
  // non-fixup commit (i.e. a commit whose header is identical to this commit's header after
  // stripping the `fixup! ` prefix), otherwise we assume this verification will happen in another
  // check.
  if (commit.isFixup) {
    if (options.nonFixupCommitHeaders && !options.nonFixupCommitHeaders.includes(commit.header)) {
      printError(
          'Unable to find match for fixup commit among prior commits: ' +
          (options.nonFixupCommitHeaders.map(x => `\n      ${x}`).join('') || '-'));
      return false;
    }

    return true;
  }

  ////////////////////////////
  // Checking commit header //
  ////////////////////////////
  if (commit.header.length > config.maxLineLength) {
    printError(`The commit message header is longer than ${config.maxLineLength} characters`);
    return false;
  }

  if (!commit.type) {
    printError(`The commit message header does not match the expected format.`);
    return false;
  }



  if (COMMIT_TYPES[commit.type] === undefined) {
    printError(`'${commit.type}' is not an allowed type.\n => TYPES: ${
        Object.keys(COMMIT_TYPES).join(', ')}`);
    return false;
  }

  /** The scope requirement level for the provided type of the commit message. */
  const scopeRequirementForType = COMMIT_TYPES[commit.type].scope;

  if (scopeRequirementForType === ScopeRequirement.Forbidden && commit.scope) {
    printError(`Scopes are forbidden for commits with type '${commit.type}', but a scope of '${
        commit.scope}' was provided.`);
    return false;
  }

  if (scopeRequirementForType === ScopeRequirement.Required && !commit.scope) {
    printError(
        `Scopes are required for commits with type '${commit.type}', but no scope was provided.`);
    return false;
  }

  if (commit.scope && !config.scopes.includes(commit.scope)) {
    printError(
        `'${commit.scope}' is not an allowed scope.\n => SCOPES: ${config.scopes.join(', ')}`);
    return false;
  }

  // Commits with the type of `release` do not require a commit body.
  if (commit.type === 'release') {
    return true;
  }

  //////////////////////////
  // Checking commit body //
  //////////////////////////

  if (!config.minBodyLengthTypeExcludes?.includes(commit.type) &&
      commit.bodyWithoutLinking.trim().length < config.minBodyLength) {
    printError(`The commit message body does not meet the minimum length of ${
        config.minBodyLength} characters`);
    return false;
  }

  const bodyByLine = commit.body.split('\n');
  const lineExceedsMaxLength = bodyByLine.some(line => {
    // Check if any line exceeds the max line length limit. The limit is ignored for
    // lines that just contain an URL (as these usually cannot be wrapped or shortened).
    return line.length > config.maxLineLength && !COMMIT_BODY_URL_LINE_RE.test(line);
  });

  if (lineExceedsMaxLength) {
    printError(
        `The commit message body contains lines greater than ${config.maxLineLength} characters`);
    return false;
  }

  return true;
}
