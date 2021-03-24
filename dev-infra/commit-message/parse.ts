/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Commit as ParsedCommit, Options, sync as parse} from 'conventional-commits-parser';


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

/**
 * A list of tuples expressing the fields to extract from each commit log entry. The tuple contains
 * two values, the first is the key for the property and the second is the template shortcut for the
 * git log command.
 */
const commitFields = {
  hash: '%H',
  shortHash: '%h',
  author: '%aN',
};
/** The additional fields to be included in commit log entries for parsing. */
export type CommitFields = typeof commitFields;
/** The commit fields described as git log format entries for parsing. */
export const commitFieldsAsFormat = (fields: CommitFields) => {
  return Object.entries(fields).map(([key, value]) => `%n-${key}-%n${value}`).join('');
};
/**
 * The git log format template to create git log entries for parsing.
 *
 * The conventional commits parser expects to parse the standard git log raw body (%B) into its
 * component parts. Additionally it will parse additional fields with keys defined by
 * `-{key name}-` separated by new lines.
 * */
export const gitLogFormatForParsing = `%B${commitFieldsAsFormat(commitFields)}`;
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
export function parseCommitMessage(fullText: string|Buffer): Commit {
  // Ensure the fullText symbol is a `string`, even if a Buffer was provided.
  fullText = fullText.toString();
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
