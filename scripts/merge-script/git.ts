/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as Octokit from '@octokit/rest';
import {spawnSync, SpawnSyncOptions, SpawnSyncReturns} from 'child_process';
import {Config} from './config';

/** Error for failed Git commands. */
export class GitCommandError extends Error {
  constructor(public commandArgs: string[]) {
    super(`Command failed: git ${commandArgs.join(' ')}`);
  }
}

export class GitClient {
  /** Short-hand for accessing the repository configuration. */
  repoConfig = this._config.repository;
  /** Octokit request parameters object for targeting the configured repository. */
  repoParams = {owner: this.repoConfig.user, repo: this.repoConfig.name};
  /** URL that resolves to the configured repository. */
  repoGitUrl = this.repoConfig.useSsh ?
      `git@github.com:${this.repoConfig.user}/${this.repoConfig.name}.git` :
      `https://${this._githubToken}@github.com/${this.repoConfig.user}/${this.repoConfig.name}.git`;
  /** Instance of the authenticated Github octokit API. */
  api: Octokit;

  constructor(private _githubToken: string, private _config: Config) {
    this.api = new Octokit({auth: _githubToken});
  }

  /** Executes the given git command. Throws if the command fails. */
  run(args: string[], options?: SpawnSyncOptions): Omit<SpawnSyncReturns<string>, 'status'> {
    const result = this.runGraceful(args, options);
    if (result.status !== 0) {
      throw new GitCommandError(args);
    }
    // Omit `status` from the type so that it's obvious that the status is never
    // non-zero as explained in the method description.
    return result as Omit<SpawnSyncReturns<string>, 'status'>;
  }

  /**
   * Spawns a given Git command process. Does not throw if the command fails. Additionally,
   * the "stderr" output is inherited and will be printed in case of errors. This makes it
   * easier to debug failed commands.
   */
  runGraceful(args: string[], options: SpawnSyncOptions = {}): SpawnSyncReturns<string> {
    // To improve the debugging experience in case something fails, we print
    // all executed Git commands.
    console.info('Executing: git', ...args);
    return spawnSync('git', args, {
      cwd: this._config.projectRoot,
      stdio: ['pipe', 'pipe', 'inherit'],
      ...options,
      // Encoding is always `utf8` and not overridable. This ensures that this method
      // always returns `string` as output instead of buffers.
      encoding: 'utf8',
    });
  }

  /** Whether the given branch contains the specified SHA. */
  hasCommit(branchName: string, sha: string): boolean {
    return this.run(['branch', branchName, '--contains', sha]).stdout !== '';
  }

  /** Gets the currently checked out branch. */
  getCurrentBranch(): string {
    return this.run(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
  }

  /** Gets whether the current Git repository has uncommitted changes. */
  hasUncommittedChanges(): boolean {
    return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
  }
}
