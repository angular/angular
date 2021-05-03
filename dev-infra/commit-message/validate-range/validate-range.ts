/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {error, green, info, red} from '../../utils/console';
import {Commit} from '../parse';
import {getCommitsInRange} from '../utils';
import {printValidationErrors, validateCommitMessage, ValidateCommitMessageOptions} from '../validate';

// Whether the provided commit is a fixup commit.
const isNonFixup = (commit: Commit) => !commit.isFixup;

// Extracts commit header (first line of commit message).
const extractCommitHeader = (commit: Commit) => commit.header;

/** Validate all commits in a provided git commit range. */
export async function validateCommitRange(from: string, to: string) {
  /** A list of tuples of the commit header string and a list of error messages for the commit. */
  const errors: [commitHeader: string, errors: string[]][] = [];

  /** A list of parsed commit messages from the range. */
  const commits = await getCommitsInRange(from, to);
  info(`Examining ${commits.length} commit(s) in the provided range: ${from}..${to}`);

  /**
   * Whether all commits in the range are valid, commits are allowed to be fixup commits for other
   * commits in the provided commit range.
   */
  const allCommitsInRangeValid = commits.every((commit, i) => {
    const options: ValidateCommitMessageOptions = {
      disallowSquash: true,
      nonFixupCommitHeaders: isNonFixup(commit) ?
          undefined :
          commits.slice(i + 1).filter(isNonFixup).map(extractCommitHeader)
    };
    const {valid, errors: localErrors} = validateCommitMessage(commit, options);
    if (localErrors.length) {
      errors.push([commit.header, localErrors]);
    }
    return valid;
  });

  if (allCommitsInRangeValid) {
    info(green('√  All commit messages in range valid.'));
  } else {
    error(red('✘  Invalid commit message'));
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
