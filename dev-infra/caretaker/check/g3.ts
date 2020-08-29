/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs-extra';
import * as multimatch from 'multimatch';
import {join} from 'path';
import {parse as parseYaml} from 'yaml';

import {getRepoBaseDir} from '../../utils/config';
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
  /** The statistical information about the git diff between master and g3. */
  const stats = getDiffStats(git);

  info.group(bold('g3 branch check'));
  info(`${commits} commits between g3 and master`)
  if (stats.g3.files === 0) {
    info('✅ No sync is needed at this time')
  }
  else {
    info(`${stats.g3.files} files changed, ${stats.g3.insertions} insertions(+), ${
        stats.g3.deletions} deletions(-) will be included in the next sync`);
  }
  info.groupEnd();
  info();
}

/**
 * Get git diff stats between master and g3, for all files and filtered to only g3 affecting files.
 */
function getDiffStats(git: GitClient) {
  /** The configuration defined for the angular robot. */
  const robotConfig =
      parseYaml(readFileSync(join(getRepoBaseDir(), '.github/angular-robot.yml')).toString());
  /** The files to be included in the g3 sync. */
  const includeFiles = robotConfig?.merge?.g3Status?.include || [];
  /** The files to be expected in the g3 sync. */
  const excludeFiles = robotConfig?.merge?.g3Status?.exclude || [];
  /** The diff stats to be returned. */
  const diffStats = {
    all: {insertions: 0, deletions: 0, files: 0},
    g3: {insertions: 0, deletions: 0, files: 0},
  };

  // Get the numstat information between master and g3
  git.run(['diff', 'upstream/g3...upstream/master', '--numstat'])
      .stdout
      // Remove the extra space after git's output.
      .trim()
      // Split each line of git output into array
      .split('\n')
      // Split each line from the git output into components parts: insertions,
      // deletions and file name respectively
      .map(line => line.split('\t'))
      // Parse number value from the insertions and deletions values
      .map(
          line => [parseInt(line[0], 10), parseInt(line[1], 10),
                   line[2]] as [number, number, string])
      // Add each line's value to the diff stats, and conditionally to the g3
      // stats as well if the file name is included in the files synced to g3.
      .forEach(([insertions, deletions, fileName]) => {
        diffStats.all.insertions += insertions;
        diffStats.all.deletions += deletions;
        diffStats.all.files += 1;
        if (checkMatchAgainstIncludeAndExclude(fileName, includeFiles, excludeFiles)) {
          diffStats.g3.insertions += insertions;
          diffStats.g3.deletions += deletions;
          diffStats.g3.files += 1;
        }
      });
  return diffStats;
}

/** Determine whether the file name passes both include and exclude checks. */
function checkMatchAgainstIncludeAndExclude(file: string, includes: string[], excludes: string[]) {
  return multimatch(multimatch(file, includes), excludes, {flipNegate: true}).length !== 0
}
