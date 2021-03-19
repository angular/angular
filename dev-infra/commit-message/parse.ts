/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Commit as ParsedCommit, Options, sync as parse} from 'conventional-commits-parser';

import {exec} from '../utils/shelljs';


/** A parsed commit, containing the information needed to validate the commit. */
export interface Commit {
  /** The full raw text of the commit. */
  fullText: string;
  /** The header line of the commit, will be used in the changelog entries. */
  header: string;
  /** The full body of the commit, not including the footer. */
  body: string;
  /** The footer of the commit, containing issue references and note sections. */
  footer: string;
  /** A list of the references to other issues made throughout the commit message. */
  references: ParsedCommit.Reference[];
  /** The type of the commit message. */
  type: string;
  /** The scope of the commit message. */
  scope: string;
  /** The npm scope of the commit message. */
  npmScope: string;
  /** The subject of the commit message. */
  subject: string;
  /** A list of breaking change notes in the commit message. */
  breakingChanges: ParsedCommit.Note[];
  /** A list of deprecation notes in the commit message. */
  deprecations: ParsedCommit.Note[];
  /** Whether the commit is a fixup commit. */
  isFixup: boolean;
  /** Whether the commit is a squash commit. */
  isSquash: boolean;
  /** Whether the commit is a revert commit. */
  isRevert: boolean;
}

/** Markers used to denote the start of a note section in a commit. */
enum NoteSections {
  BREAKING_CHANGE = 'BREAKING CHANGE',
  DEPRECATED = 'DEPRECATED',
}
/** Regex determining if a commit is a fixup. */
const FIXUP_PREFIX_RE = /^fixup! /i;
/** Regex determining if a commit is a squash. */
const SQUASH_PREFIX_RE = /^squash! /i;
/** Regex determining if a commit is a revert. */
const REVERT_PREFIX_RE = /^revert:? /i;
/**
 * Regex pattern for parsing the header line of a commit.
 *
 * Several groups are being matched to be used in the parsed commit object, being mapped to the
 * `headerCorrespondence` object.
 *
 * The pattern can be broken down into component parts:
 * - `(\w+)` - a capturing group discovering the type of the commit.
 * - `(?:\((?:([^/]+)\/)?([^)]+)\))?` - a pair of capturing groups to capture the scope and,
 * optionally the npmScope of the commit.
 * - `(.*)` - a capturing group discovering the subject of the commit.
 */
const headerPattern = /^(\w+)(?:\((?:([^/]+)\/)?([^)]+)\))?: (.*)$/;
/**
 * The property names used for the values extracted from the header via the `headerPattern` regex.
 */
const headerCorrespondence = ['type', 'npmScope', 'scope', 'subject'];
/**
 * Configuration options for the commit parser.
 *
 * NOTE: An extended type from `Options` must be used because the current
 * @types/conventional-commits-parser version does not include the `notesPattern` field.
 */
const parseOptions: Options&{notesPattern: (keywords: string) => RegExp} = {
  commentChar: '#',
  headerPattern,
  headerCorrespondence,
  noteKeywords: [NoteSections.BREAKING_CHANGE, NoteSections.DEPRECATED],
  notesPattern: (keywords: string) => new RegExp(`(${keywords})(?:: ?)(.*)`),
};


/** Parse a full commit message into its composite parts. */
export function parseCommitMessage(fullText: string): Commit {
  /** The commit message text with the fixup and squash markers stripped out. */
  const strippedCommitMsg = fullText.replace(FIXUP_PREFIX_RE, '')
                                .replace(SQUASH_PREFIX_RE, '')
                                .replace(REVERT_PREFIX_RE, '');
  /** The initially parsed commit. */
  const commit = parse(strippedCommitMsg, parseOptions);
  /** A list of breaking change notes from the commit. */
  const breakingChanges: ParsedCommit.Note[] = [];
  /** A list of deprecation notes from the commit. */
  const deprecations: ParsedCommit.Note[] = [];

  // Extract the commit message notes by marked types into their respective lists.
  commit.notes.forEach((note: ParsedCommit.Note) => {
    if (note.title === NoteSections.BREAKING_CHANGE) {
      return breakingChanges.push(note);
    }
    if (note.title === NoteSections.DEPRECATED) {
      return deprecations.push(note);
    }
  });

  return {
    fullText,
    breakingChanges,
    deprecations,
    body: commit.body || '',
    footer: commit.footer || '',
    header: commit.header || '',
    references: commit.references,
    scope: commit.scope || '',
    subject: commit.subject || '',
    type: commit.type || '',
    npmScope: commit.npmScope || '',
    isFixup: FIXUP_PREFIX_RE.test(fullText),
    isSquash: SQUASH_PREFIX_RE.test(fullText),
    isRevert: REVERT_PREFIX_RE.test(fullText),
  };
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
