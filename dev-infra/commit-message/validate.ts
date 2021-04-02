/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {error} from '../utils/console';

import {COMMIT_TYPES, getCommitMessageConfig, ScopeRequirement} from './config';
import {Commit, parseCommitMessage} from './parse';

/** Options for commit message validation. */
export interface ValidateCommitMessageOptions {
  disallowSquash?: boolean;
  nonFixupCommitHeaders?: string[];
}

/** The result of a commit message validation check. */
export interface ValidateCommitMessageResult {
  valid: boolean;
  errors: string[];
  commit: Commit;
}

/** Regex matching a URL for an entire commit body line. */
const COMMIT_BODY_URL_LINE_RE = /^https?:\/\/.*$/;
/**
 * Regex matching a breaking change.
 *
 * - Starts with BREAKING CHANGE
 * - Followed by a colon
 * - Followed by a single space or two consecutive new lines
 *
 * NB: Anything after `BREAKING CHANGE` is optional to facilitate the validation.
 */
const COMMIT_BODY_BREAKING_CHANGE_RE = /^BREAKING CHANGE(:( |\n{2}))?/m;

/** Validate a commit message against using the local repo's config. */
export function validateCommitMessage(
    commitMsg: string|Commit,
    options: ValidateCommitMessageOptions = {}): ValidateCommitMessageResult {
  const config = getCommitMessageConfig().commitMessage;
  const commit = typeof commitMsg === 'string' ? parseCommitMessage(commitMsg) : commitMsg;
  const errors: string[] = [];

  /** Perform the validation checks against the parsed commit. */
  function validateCommitAndCollectErrors() {
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

    const fullScope = commit.npmScope ? `${commit.npmScope}/${commit.scope}` : commit.scope;
    if (fullScope && !config.scopes.includes(fullScope)) {
      errors.push(
          `'${fullScope}' is not an allowed scope.\n => SCOPES: ${config.scopes.join(', ')}`);
      return false;
    }

    // Commits with the type of `release` do not require a commit body.
    if (commit.type === 'release') {
      return true;
    }

    //////////////////////////
    // Checking commit body //
    //////////////////////////

    // Due to an issue in which conventional-commits-parser considers all parts of a commit after
    // a `#` reference to be the footer, we check the length of all of the commit content after the
    // header. In the future, we expect to be able to check only the body once the parser properly
    // handles this case.
    const allNonHeaderContent = `${commit.body.trim()}\n${commit.footer.trim()}`;

    if (!config.minBodyLengthTypeExcludes?.includes(commit.type) &&
        allNonHeaderContent.length < config.minBodyLength) {
      errors.push(`The commit message body does not meet the minimum length of ${
          config.minBodyLength} characters`);
      return false;
    }

    const bodyByLine = commit.body.split('\n');
    const lineExceedsMaxLength = bodyByLine.some((line: string) => {
      // Check if any line exceeds the max line length limit. The limit is ignored for
      // lines that just contain an URL (as these usually cannot be wrapped or shortened).
      return line.length > config.maxLineLength && !COMMIT_BODY_URL_LINE_RE.test(line);
    });

    if (lineExceedsMaxLength) {
      errors.push(`The commit message body contains lines greater than ${
          config.maxLineLength} characters.`);
      return false;
    }

    // Breaking change
    // Check if the commit message contains a valid break change description.
    // https://github.com/angular/angular/blob/88fbc066775ab1a2f6a8c75f933375b46d8fa9a4/CONTRIBUTING.md#commit-message-footer
    const hasBreakingChange = COMMIT_BODY_BREAKING_CHANGE_RE.exec(commit.fullText);
    if (hasBreakingChange !== null) {
      const [, breakingChangeDescription] = hasBreakingChange;
      if (!breakingChangeDescription) {
        // Not followed by :, space or two consecutive new lines,
        errors.push(`The commit message body contains an invalid breaking change description.`);
        return false;
      }
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
  print(`BREAKING CHANGE: <breaking change summary>`);
  print();
  print(`<breaking change description>`);
  print();
  print();
}
