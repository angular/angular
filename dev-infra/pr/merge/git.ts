/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as Octokit from '@octokit/rest';
import {spawnSync, SpawnSyncOptions, SpawnSyncReturns} from 'child_process';

import {info, yellow} from '../../utils/console';

import {MergeConfigWithRemote} from './config';

/** Github response type extended to include the `x-oauth-scopes` headers presence. */
type RateLimitResponseWithOAuthScopeHeader = Octokit.Response<Octokit.RateLimitGetResponse>&{
  headers: {'x-oauth-scopes': string};
};

/** Error for failed Github API requests. */
export class GithubApiRequestError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Error for failed Git commands. */
export class GitCommandError extends Error {
  constructor(client: GitClient, public args: string[]) {
    // Errors are not guaranteed to be caught. To ensure that we don't
    // accidentally leak the Github token that might be used in a command,
    // we sanitize the command that will be part of the error message.
    super(`Command failed: git ${client.omitGithubTokenFromMessage(args.join(' '))}`);
  }
}

export class GitClient {
  /** Short-hand for accessing the remote configuration. */
  remoteConfig = this._config.remote;
  /** Octokit request parameters object for targeting the configured remote. */
  remoteParams = {owner: this.remoteConfig.owner, repo: this.remoteConfig.name};
  /** URL that resolves to the configured repository. */
  repoGitUrl = this.remoteConfig.useSsh ?
      `git@github.com:${this.remoteConfig.owner}/${this.remoteConfig.name}.git` :
      `https://${this._githubToken}@github.com/${this.remoteConfig.owner}/${
          this.remoteConfig.name}.git`;
  /** Instance of the authenticated Github octokit API. */
  api: Octokit;

  /** The OAuth scopes available for the provided Github token. */
  private _oauthScopes = Promise.resolve<string[]>([]);
  /** Regular expression that matches the provided Github token. */
  private _tokenRegex = new RegExp(this._githubToken, 'g');

  constructor(
      private _projectRoot: string, private _githubToken: string,
      private _config: MergeConfigWithRemote) {
    this.api = new Octokit({auth: _githubToken});
    this.api.hook.error('request', error => {
      // Wrap API errors in a known error class. This allows us to
      // expect Github API errors better and in a non-ambiguous way.
      throw new GithubApiRequestError(error.status, error.message);
    });
  }

  /** Executes the given git command. Throws if the command fails. */
  run(args: string[], options?: SpawnSyncOptions): Omit<SpawnSyncReturns<string>, 'status'> {
    const result = this.runGraceful(args, options);
    if (result.status !== 0) {
      throw new GitCommandError(this, args);
    }
    // Omit `status` from the type so that it's obvious that the status is never
    // non-zero as explained in the method description.
    return result as Omit<SpawnSyncReturns<string>, 'status'>;
  }

  /**
   * Spawns a given Git command process. Does not throw if the command fails. Additionally,
   * if there is any stderr output, the output will be printed. This makes it easier to
   * debug failed commands.
   */
  runGraceful(args: string[], options: SpawnSyncOptions = {}): SpawnSyncReturns<string> {
    // To improve the debugging experience in case something fails, we print all executed
    // Git commands. Note that we do not want to print the token if is contained in the
    // command. It's common to share errors with others if the tool failed.
    info('Executing: git', this.omitGithubTokenFromMessage(args.join(' ')));

    const result = spawnSync('git', args, {
      cwd: this._projectRoot,
      stdio: 'pipe',
      ...options,
      // Encoding is always `utf8` and not overridable. This ensures that this method
      // always returns `string` as output instead of buffers.
      encoding: 'utf8',
    });

    if (result.stderr !== null) {
      // Git sometimes prints the command if it failed. This means that it could
      // potentially leak the Github token used for accessing the remote. To avoid
      // printing a token, we sanitize the string before printing the stderr output.
      process.stderr.write(this.omitGithubTokenFromMessage(result.stderr));
    }

    return result;
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

  /** Sanitizes a given message by omitting the provided Github token if present. */
  omitGithubTokenFromMessage(value: string): string {
    return value.replace(this._tokenRegex, '<TOKEN>');
  }

  /**
   * Assert the GitClient instance is using a token with permissions for the all of the
   * provided OAuth scopes.
   */
  async hasOauthScopes(...requestedScopes: string[]): Promise<true|{error: string}> {
    const missingScopes: string[] = [];
    const scopes = await this.getAuthScopes();
    requestedScopes.forEach(scope => {
      if (!scopes.includes(scope)) {
        missingScopes.push(scope);
      }
    });
    // If no missing scopes are found, return true to indicate all OAuth Scopes are available.
    if (missingScopes.length === 0) {
      return true;
    }

    /**
     * Preconstructed error message to log to the user, providing missing scopes and
     * remediation instructions.
     **/
    const error =
        `The provided <TOKEN> does not have required permissions due to missing scope(s): ` +
        `${yellow(missingScopes.join(', '))}\n\n` +
        `Update the token in use at:\n` +
        `  https://github.com/settings/tokens\n\n` +
        `Alternatively, a new token can be created at: https://github.com/settings/tokens/new\n`;

    return {error};
  }


  /**
   * Retrieves the OAuth scopes for the loaded Github token, returning the already retrived
   * list of OAuth scopes if available.
   **/
  private getAuthScopes() {
    // If the OAuth scopes have already been loaded, return the Promise containing them.
    if (this._oauthScopes) {
      return this._oauthScopes;
    }
    // OAuth scopes are loaded via the /rate_limit endpoint to prevent
    // usage of a request against that rate_limit for this lookup.
    this._oauthScopes = this.api.rateLimit.get().then(_response => {
      const response = _response as RateLimitResponseWithOAuthScopeHeader;
      const scopes: string = response.headers['x-oauth-scopes'] || '';
      return scopes.split(',').map(scope => scope.trim());
    });
    return this._oauthScopes;
  }
}
