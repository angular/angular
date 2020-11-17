/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {exec} from '../utils/shelljs';

import {parseCommitMessage, ParsedCommitMessage} from './parse';

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
