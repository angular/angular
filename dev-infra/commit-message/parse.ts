/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Commit, Options, sync as parse} from 'conventional-commits-parser';

import {exec} from '../utils/shelljs';

/** Regex determining if a commit is a fixup. */
const FIXUP_PREFIX_RE = /^fixup! /i;
/** Regex determining if a commit is a squash. */
const SQUASH_PREFIX_RE = /^squash! /i;
/** Regex determining if a commit is a revert. */
const REVERT_PREFIX_RE = /^revert:? /i;

enum NoteSections {
  BREAKING_CHANGE = 'BREAKING_CHANGE',
  DEPRECATED = 'DEPRECATED',
}

/** Parse a full commit message into its composite parts. */
export function parseCommitMessage(commit: string): Commit {
  const parsedCommit = parse(commit, parseOptions);
  parsedCommit.fullText = commit;
  return parsedCommit;
}

/** Whether the commit is a fixup commit. */
export function isFixup(commit: Commit) {
  return FIXUP_PREFIX_RE.test(commit.header!);
}

/** Get the header of a commit with the fixup marker. */
export function getHeaderWithoutFixup(commit: Commit) {
  return commit.header!.replace(FIXUP_PREFIX_RE, '');
}

/** Whether the commit is a squash commit. */
export function isSquash(commit: Commit) {
  return SQUASH_PREFIX_RE.test(commit.header!);
}

/** Whether the commit is a revert commit. */
export function isRevert(commit: Commit) {
  return REVERT_PREFIX_RE.test(commit.header!);
}

/** Retrieve and parse each commit message in a provide range. */
export function parseCommitMessagesForRange(range: string): Commit[] {
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


/** Configuration options for the commit parser. */
const parseOptions: Options = {
  commentChar: '#',
  headerPattern: /^(\w*)(?:\((?:([^/]+)\/)?(.*)\))?: (.*)$/,
  headerCorrespondence: ['type', 'package', 'scope', 'subject'],
  noteKeywords: [NoteSections.BREAKING_CHANGE, NoteSections.DEPRECATED],
};
