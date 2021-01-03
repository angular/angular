/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {error} from '../utils/console';

import {COMMIT_TYPES, getCommitMessageConfig, ScopeRequirement} from './config';
import {parseCommitMessage, ParsedCommitMessage} from './parse';

/** Options for commit message validation. */
export interface ValidateCommitMessageOptions {
  disallowSquash?: boolean;
  nonFixupCommitHeaders?: string[];
}

/** The result of a commit message validation check. */
export interface ValidateCommitMessageResult {
  valid: boolean;
  errors: string[];
  commit: ParsedCommitMessage;
}

/** Regex matching a URL for an entire commit body line. */
const COMMIT_BODY_URL_LINE_RE = /^https?:\/\/.*$/;

/** Validate a commit message against using the local repo's config. */
export function validateCommitMessage(
    commitMsg: string|ParsedCommitMessage,
    options: ValidateCommitMessageOptions = {}): ValidateCommitMessageResult {
  const config = getCommitMessageConfig().commitMessage;
  const commit = typeof commitMsg === 'string' ? parseCommitMessage(commitMsg) : commitMsg;
  const errors: string[] = [];

  /** Perform the validation checks against the parsed commit. */
  function validateCommitAndCollectErrors() {
    // TODO(josephperrott): Remove early return calls when commit message errors are found

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
        errors.push('The commit must be manually squashed into the target commit');
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
        errors.push(
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
      errors.push(`The commit message header is longer than ${config.maxLineLength} characters`);
      return false;
    }

    if (!commit.type) {
      errors.push(`The commit message header does not match the expected format.`);
      return false;
    }

    if (COMMIT_TYPES[commit.type] === undefined) {
      errors.push(`'${commit.type}' is not an allowed type.\n => TYPES: ${
          Object.keys(COMMIT_TYPES).join(', ')}`);
      return false;
    }

    /** The scope requirement level for the provided type of the commit message. */
    const scopeRequirementForType = COMMIT_TYPES[commit.type].scope;

    if (scopeRequirementForType === ScopeRequirement.Forbidden && commit.scope) {
      errors.push(`Scopes are forbidden for commits with type '${commit.type}', but a scope of '${
          commit.scope}' was provided.`);
      return false;
    }

    if (scopeRequirementForType === ScopeRequirement.Required && !commit.scope) {
      errors.push(
          `Scopes are required for commits with type '${commit.type}', but no scope was provided.`);
      return false;
    }

    if (commit.scope && !config.scopes.includes(commit.scope)) {
      errors.push(
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
      errors.push(`The commit message body does not meet the minimum length of ${
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
      errors.push(
          `The commit message body contains lines greater than ${config.maxLineLength} characters`);
      return false;
    }

    return true;
  }

  return {valid: validateCommitAndCollectErrors(), errors, commit};
}


/** Print the error messages from the commit message validation to the console. */
export function printValidationErrors(errors: string[], print = error) {
  print.group(`Error${errors.length === 1 ? '' : 's'}:`);
  errors.forEach(line => print(line));
  print.groupEnd();
  print();
  print('The expected format for a commit is: ');
  print('<type>(<scope>): <summary>');
  print();
  print('<body>');
  print();
}
