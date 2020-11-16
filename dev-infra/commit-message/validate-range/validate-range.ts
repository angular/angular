/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {error, info} from '../../utils/console';
import {exec} from '../../utils/shelljs';

import {parseCommitMessage} from '../parse';
import {printValidationErrors, validateCommitMessage, ValidateCommitMessageOptions} from '../validate';

// Whether the provided commit is a fixup commit.
const isNonFixup = (m: string) => !parseCommitMessage(m).isFixup;

// Extracts commit header (first line of commit message).
const extractCommitHeader = (m: string) => parseCommitMessage(m).header;

/** Validate all commits in a provided git commit range. */
export function validateCommitRange(range: string) {
  /**
   * A random value is used as a string to allow for a definite split point in the git log result.
   */
  const randomValueSeparator = `${Math.random()}`;
  /**
   * Custom git log format that provides the commit header and body, separated as expected with the
   * custom separator as the trailing value.
   */
  const gitLogFormat = `%s%n%n%b${randomValueSeparator}`;
  /**
   * A list of tuples containing a commit header string and the list of error messages for the
   * commit.
   */
  const errors: [commitHeader: string, errors: string[]][] = [];

  // Retrieve the commits in the provided range.
  const result = exec(`git log --reverse --format=${gitLogFormat} ${range}`);
  if (result.code) {
    throw new Error(`Failed to get all commits in the range: \n  ${result.stderr}`);
  }

  // Separate the commits from a single string into individual commits
  const commits = result.split(randomValueSeparator).map(l => l.trim()).filter(line => !!line);

  info(`Examining ${commits.length} commit(s) in the provided range: ${range}`);

  // Check each commit in the commit range.  Commits are allowed to be fixup commits for other
  // commits in the provided commit range.
  const allCommitsInRangeValid = commits.every((m, i) => {
    const options: ValidateCommitMessageOptions = {
      disallowSquash: true,
      nonFixupCommitHeaders: isNonFixup(m) ?
          undefined :
          commits.slice(0, i).filter(isNonFixup).map(extractCommitHeader)
    };
    const {valid, errors: localErrors, commit} = validateCommitMessage(m, options);
    if (localErrors.length) {
      errors.push([commit.header, localErrors]);
    }
    return valid;
  });

  if (allCommitsInRangeValid) {
    info('√  All commit messages in range valid.');
  } else {
    error('✘  Invalid commit message');
    errors.forEach(([header, validationErrors]) => {
      error.group(header);
      printValidationErrors(validationErrors);
      error.groupEnd();
    });
    // Exit with a non-zero exit code if invalid commit messages have
    // been discovered.
    process.exit(1);
  }
}
