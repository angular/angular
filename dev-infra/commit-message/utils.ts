/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as gitCommits_ from 'git-raw-commits';

import {CommitFromGitLog, gitLogFormatForParsing, parseCommitFromGitLog} from './parse';

// Set `gitCommits` as this imported value to address "Cannot call a namespace" error.
const gitCommits = gitCommits_;


/**
 * Find all commits within the given range and return an object describing those.
 */
export function getCommitsInRange(from: string, to: string = 'HEAD'): Promise<CommitFromGitLog[]> {
  return new Promise((resolve, reject) => {
    /** List of parsed commit objects. */
    const commits: CommitFromGitLog[] = [];
    /** Stream of raw git commit strings in the range provided. */
    const commitStream = gitCommits({from, to, format: gitLogFormatForParsing});

    // Accumulate the parsed commits for each commit from the Readable stream into an array, then
    // resolve the promise with the array when the Readable stream ends.
    commitStream.on('data', (commit: Buffer) => commits.push(parseCommitFromGitLog(commit)));
    commitStream.on('error', (err: Error) => reject(err));
    commitStream.on('end', () => resolve(commits));
  });
}
