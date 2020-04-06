/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {getAngularDevConfig} from '../utils/config';
import {CommitMessageConfig} from './config';

/** Options for commit message validation. */
export interface ValidateCommitMessageOptions {
  disallowSquash?: boolean;
  nonFixupCommitHeaders?: string[];
}

const FIXUP_PREFIX_RE = /^fixup! /i;
const GITHUB_LINKING_RE = /((closed?s?)|(fix(es)?(ed)?)|(resolved?s?))\s\#(\d+)/ig;
const SQUASH_PREFIX_RE = /^squash! /i;
const REVERT_PREFIX_RE = /^revert:? /i;
const TYPE_SCOPE_RE = /^(\w+)(?:\(([^)]+)\))?\:\s(.+)$/;
const COMMIT_HEADER_RE = /^(.*)/i;
const COMMIT_BODY_RE = /^.*\n\n([\s\S]*)$/;

/** Parse a full commit message into its composite parts. */
export function parseCommitMessage(commitMsg: string) {
  let header = '';
  let body = '';
  let bodyWithoutLinking = '';
  let type = '';
  let scope = '';
  let subject = '';

  if (COMMIT_HEADER_RE.test(commitMsg)) {
    header = COMMIT_HEADER_RE.exec(commitMsg)![1]
                 .replace(FIXUP_PREFIX_RE, '')
                 .replace(SQUASH_PREFIX_RE, '');
  }
  if (COMMIT_BODY_RE.test(commitMsg)) {
    body = COMMIT_BODY_RE.exec(commitMsg)![1];
    bodyWithoutLinking = body.replace(GITHUB_LINKING_RE, '');
  }

  if (TYPE_SCOPE_RE.test(header)) {
    const parsedCommitHeader = TYPE_SCOPE_RE.exec(header)!;
    type = parsedCommitHeader[1];
    scope = parsedCommitHeader[2];
    subject = parsedCommitHeader[3];
  }
  return {
    header,
    body,
    bodyWithoutLinking,
    type,
    scope,
    subject,
    isFixup: FIXUP_PREFIX_RE.test(commitMsg),
    isSquash: SQUASH_PREFIX_RE.test(commitMsg),
    isRevert: REVERT_PREFIX_RE.test(commitMsg),
  };
}

/** Validate a commit message against using the local repo's config. */
export function validateCommitMessage(
    commitMsg: string, options: ValidateCommitMessageOptions = {}) {
  function error(errorMessage: string) {
    console.error(
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

  const config = getAngularDevConfig<'commitMessage', CommitMessageConfig>().commitMessage;
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
      error('The commit must be manually squashed into the target commit');
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
      error(
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
    error(`The commit message header is longer than ${config.maxLineLength} characters`);
    return false;
  }

  if (!commit.type) {
    error(`The commit message header does not match the expected format.`);
    return false;
  }

  if (!config.types.includes(commit.type)) {
    error(`'${commit.type}' is not an allowed type.\n => TYPES: ${config.types.join(', ')}`);
    return false;
  }

  if (commit.scope && !config.scopes.includes(commit.scope)) {
    error(`'${commit.scope}' is not an allowed scope.\n => SCOPES: ${config.scopes.join(', ')}`);
    return false;
  }

  //////////////////////////
  // Checking commit body //
  //////////////////////////

  if (commit.bodyWithoutLinking.trim().length < config.minBodyLength) {
    error(`The commit message body does not meet the minimum length of ${
        config.minBodyLength} characters`);
    return false;
  }

  const bodyByLine = commit.body.split('\n');
  if (bodyByLine.some(line => line.length > config.maxLineLength)) {
    error(
        `The commit messsage body contains lines greater than ${config.maxLineLength} characters`);
    return false;
  }

  return true;
}
