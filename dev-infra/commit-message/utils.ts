/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as gitCommits_ from 'git-raw-commits';
import {Observable, ReplaySubject} from 'rxjs';
import {scan} from 'rxjs/operators';

import {Commit, gitLogFormatForParsing, parseCommitMessage} from './parse';

// Set `gitCommits` as this imported value to address "Cannot call a namespace" error.
const gitCommits = gitCommits_;


/**
 * Create an observable emiting a `Commit` for each commit in the range provided.
 */
export function getCommitsInRange(from: string, to: string = 'HEAD'): Observable<Commit> {
  /** Subject emiting `Commit`s. */
  const commitSubject = new ReplaySubject<Commit>();
  /** Stream of raw git commit strings in the range provided. */
  const commitStream = gitCommits({from, to, format: gitLogFormatForParsing});

  // Emit a parsed commit for each commit from the Readable stream, completing the subject when
  // the Readable stream ends.
  commitStream.on('data', (commit: string) => commitSubject.next(parseCommitMessage(commit)));
  commitStream.on('error', (err: Error) => commitSubject.error(err));
  commitStream.on('end', () => commitSubject.complete());

  return commitSubject.asObservable();
}


/** A pipable operator which combines an observable of Commit objects into one Commit[]. */
export function toCommitList() {
  return scan((commits: Commit[], commit: Commit) => [...commits, commit], []);
}
