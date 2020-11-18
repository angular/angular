/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {exec} from '../utils/shelljs';

/** A parsed commit message. */
export interface ParsedCommitMessage {
  header: string;
  body: string;
  bodyWithoutLinking: string;
  type: string;
  scope: string;
  subject: string;
  isFixup: boolean;
  isSquash: boolean;
  isRevert: boolean;
}

/** Regex determining if a commit is a fixup. */
const FIXUP_PREFIX_RE = /^fixup! /i;
/** Regex finding all github keyword links. */
const GITHUB_LINKING_RE = /((closed?s?)|(fix(es)?(ed)?)|(resolved?s?))\s\#(\d+)/ig;
/** Regex determining if a commit is a squash. */
const SQUASH_PREFIX_RE = /^squash! /i;
/** Regex determining if a commit is a revert. */
const REVERT_PREFIX_RE = /^revert:? /i;
/** Regex determining the scope of a commit if provided. */
const TYPE_SCOPE_RE = /^(\w+)(?:\(([^)]+)\))?\:\s(.+)$/;
/** Regex determining the entire header line of the commit. */
const COMMIT_HEADER_RE = /^(.*)/i;
/** Regex determining the body of the commit. */
const COMMIT_BODY_RE = /^.*\n\n([\s\S]*)$/;

/** Parse a full commit message into its composite parts. */
export function parseCommitMessage(commitMsg: string): ParsedCommitMessage {
  // Ignore comments (i.e. lines starting with `#`). Comments are automatically removed by git and
  // should not be considered part of the final commit message.
  commitMsg = commitMsg.split('\n').filter(line => !line.startsWith('#')).join('\n');

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

/** Retrieve and parse each commit message in a provide range. */
export function parseCommitMessagesForRange(range: string): ParsedCommitMessage[] {
  /** A random number used as a split point in the git log result. */
  const randomValueSeparator = `${Math.random()}`;
  /**
   * Custom git log format that provides the commit header and body, separated as expected with the
   * custom separator as the trailing value.
   */
  const gitLogFormat = `%s%n%n%b${randomValueSeparator}`;

  // Retrieve the commits in the provided range.
  const result = exec(`git log --reverse --format=${gitLogFormat} ${range}`);
  if (result.code) {
    throw new Error(`Failed to get all commits in the range:\n  ${result.stderr}`);
  }

  return result
      // Separate the commits from a single string into individual commits.
      .split(randomValueSeparator)
      // Remove extra space before and after each commit message.
      .map(l => l.trim())
      // Remove any superfluous lines which remain from the split.
      .filter(line => !!line)
      // Parse each commit message.
      .map(commit => parseCommitMessage(commit));
}
