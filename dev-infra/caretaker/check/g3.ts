/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, readFileSync} from 'fs-extra';
import * as multimatch from 'multimatch';
import {join} from 'path';
import {parse as parseYaml} from 'yaml';

import {getRepoBaseDir} from '../../utils/config';
import {bold, debug, info} from '../../utils/console';
import {GitClient} from '../../utils/git';

/** Compare the upstream master to the upstream g3 branch, if it exists. */
export async function printG3Comparison(git: GitClient) {
  const angularRobotFilePath = join(getRepoBaseDir(), '.github/angular-robot.yml');
  if (!existsSync(angularRobotFilePath)) {
    return debug('No angular robot configuration file exists, skipping.');
  }

  /** The configuration defined for the angular robot. */
  const robotConfig = parseYaml(readFileSync(angularRobotFilePath).toString());
  /** The files to be included in the g3 sync. */
  const includeFiles = robotConfig?.merge?.g3Status?.include || [];
  /** The files to be expected in the g3 sync. */
  const excludeFiles = robotConfig?.merge?.g3Status?.exclude || [];

  if (includeFiles.length === 0 && excludeFiles.length === 0) {
    debug('No g3Status include or exclude lists are defined in the angular robot configuration,');
    debug('skipping.');
    return;
  }

  /** Random prefix to create unique branch names. */
  const randomPrefix = `prefix${Math.floor(Math.random() * 1000000)}`;
  /** Ref name of the temporary master branch. */
  const masterRef = `${randomPrefix}-master`;
  /** Ref name of the temporary g3 branch. */
  const g3Ref = `${randomPrefix}-g3`;
  /** Url of the ref for fetching master and g3 branches. */
  const refUrl = `https://github.com/${git.remoteConfig.owner}/${git.remoteConfig.name}.git`;
  /** The result fo the fetch command. */
  const fetchResult = git.runGraceful(['fetch', refUrl, `master:${masterRef}`, `g3:${g3Ref}`]);

  // If the upstream repository does not have a g3 branch to compare to, skip the comparison.
  if (fetchResult.status !== 0) {
    if (fetchResult.stderr.includes(`couldn't find remote ref g3`)) {
      return debug('No g3 branch exists on upstream, skipping.');
    }
    throw Error('Fetch of master and g3 branches for comparison failed.');
  }

  /** The statistical information about the git diff between master and g3. */
  const stats = getDiffStats(git);

  // Delete the temporarily created mater and g3 branches.
  git.runGraceful(['branch', '-D', masterRef, g3Ref]);

  info.group(bold('g3 branch check'));
  info(`${stats.commits} commits between g3 and master`);
  if (stats.files === 0) {
    info('✅ No sync is needed at this time');
  } else {
    info(`${stats.files} files changed, ${stats.insertions} insertions(+), ${
        stats.deletions} deletions(-) will be included in the next sync`);
  }
  info.groupEnd();
  info();


  /**
   * Get git diff stats between master and g3, for all files and filtered to only g3 affecting
   * files.
   */
  function getDiffStats(git: GitClient) {
    /** The diff stats to be returned. */
    const stats = {
      insertions: 0,
      deletions: 0,
      files: 0,
      commits: 0,
    };


    // Determine the number of commits between master and g3 refs. */
    stats.commits = parseInt(git.run(['rev-list', '--count', `${g3Ref}..${masterRef}`]).stdout, 10);

    // Get the numstat information between master and g3
    git.run(['diff', `${g3Ref}...${masterRef}`, '--numstat'])
        .stdout
        // Remove the extra space after git's output.
        .trim()
        // Split each line of git output into array
        .split('\n')
        // Split each line from the git output into components parts: insertions,
        // deletions and file name respectively
        .map(line => line.split('\t'))
        // Parse number value from the insertions and deletions values
        // Example raw line input:
        //   10\t5\tsrc/file/name.ts
        .map(line => [Number(line[0]), Number(line[1]), line[2]] as [number, number, string])
        // Add each line's value to the diff stats, and conditionally to the g3
        // stats as well if the file name is included in the files synced to g3.
        .forEach(([insertions, deletions, fileName]) => {
          if (checkMatchAgainstIncludeAndExclude(fileName, includeFiles, excludeFiles)) {
            stats.insertions += insertions;
            stats.deletions += deletions;
            stats.files += 1;
          }
        });
    return stats;
  }

  /** Determine whether the file name passes both include and exclude checks. */
  function checkMatchAgainstIncludeAndExclude(
      file: string, includes: string[], excludes: string[]) {
    return multimatch(multimatch(file, includes), excludes, {flipNegate: true}).length !== 0;
  }
}
