/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {exec} from 'shelljs';
import {parseCommitMessage, validateCommitMessage, ValidateCommitMessageOptions} from './validate';

// Whether the provided commit is a fixup commit.
const isNonFixup = (m: string) => !parseCommitMessage(m).isFixup;

/** Validate all commits in a provided git commit range. */
export function validateCommitRange(range: string) {
  // A random value is used as a string to allow for a definite split point in the git log result.
  const randomValueSeparator = `${Math.random()}`;
  // Custom git log format that provides the commit header and body, separated as expected with
  // the custom separator as the trailing value.
  const gitLogFormat = `%s%n%n%b${randomValueSeparator}`;

  // Retrieve the commits in the provided range.
  const result = exec(`git log --reverse --format=${gitLogFormat} ${range}`, {silent: true});
  if (result.code) {
    throw new Error(`Failed to get all commits in the range: \n  ${result.stderr}`);
  }

  // Separate the commits from a single string into individual commits
  const commits = result.split(randomValueSeparator).map(l => l.trim()).filter(line => !!line);

  console.info(`Examining ${commits.length} commit(s) in the provided range: ${range}`);

  // Check each commit in the commit range.  Commits are allowed to be fixup commits for other
  // commits in the provided commit range.
  const allCommitsInRangeValid = commits.every((m, i) => {
    const options: ValidateCommitMessageOptions = {
      disallowSquash: true,
      nonFixupCommitHeaders: isNonFixup(m) ? undefined : commits.slice(0, i).filter(isNonFixup)
    };
    return validateCommitMessage(m, options);
  });
  if (allCommitsInRangeValid) {
    console.info('√  All commit messages in range valid.');
  }
}
