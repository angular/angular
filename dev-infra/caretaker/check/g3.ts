/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, debug, info} from '../../utils/console';
import {GitClient} from '../../utils/git';

/** Compare the upstream master to the upstream g3 branch, if it exists. */
export async function getG3Comparison(git: GitClient) {
  git.run(['fetch', 'upstream']);
  // If the upstream repository does not have a g3 branch to compare to, skip the comparison.
  if (git.runGraceful(['show-branch', 'remotes/upstream/g3']).status !== 0) {
    debug('No g3 branch exists on upstream, skipping.');
    return;
  }
  /** Number of commits between master and g3 refs. */
  const commits = git.run(['rev-list', '--count', 'upstream/g3...upstream/master']).stdout.trim();
  /** git diff statistic information for diff between master and g3 refs. */
  const diffStats = git.run(['diff', 'upstream/g3...upstream/master', '--shortstat']).stdout.trim();

  info.group(bold('g3 branch check'));
  info(`${diffStats} over ${commits} commit(s)`);
  info.groupEnd();
  info();
}
