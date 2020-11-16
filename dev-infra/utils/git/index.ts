/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as Octokit from '@octokit/rest';
import {spawnSync, SpawnSyncOptions, SpawnSyncReturns} from 'child_process';

import {getConfig, getRepoBaseDir, NgDevConfig} from '../config';
import {debug, info, yellow} from '../console';
import {GithubClient} from './github';
import {getRepositoryGitUrl, GITHUB_TOKEN_GENERATE_URL, GITHUB_TOKEN_SETTINGS_URL} from './github-urls';

/** Github response type extended to include the `x-oauth-scopes` headers presence. */
type RateLimitResponseWithOAuthScopeHeader = Octokit.Response<Octokit.RateLimitGetResponse>&{
  headers: {'x-oauth-scopes': string};
};

/** Describes a function that can be used to test for given Github OAuth scopes. */
export type OAuthScopeTestFunction = (scopes: string[], missing: string[]) => void;

/** Error for failed Git commands. */
export class GitCommandError extends Error {
  constructor(client: GitClient, public args: string[]) {
    // Errors are not guaranteed to be caught. To ensure that we don't
    // accidentally leak the Github token that might be used in a command,
    // we sanitize the command that will be part of the error message.
    super(`Command failed: git ${client.omitGithubTokenFromMessage(args.join(' '))}`);
  }
}

/**
 * Common client for performing Git interactions with a given remote.
 *
 * Takes in two optional arguments:
 *   `githubToken`: the token used for authentication in Github interactions, by default empty
 *     allowing readonly actions.
 *   `config`: The dev-infra configuration containing information about the remote. By default
 *     the dev-infra configuration is loaded with its Github configuration.
 **/
export class GitClient {
  /** Whether verbose logging of Git actions should be used. */
  static LOG_COMMANDS = true;
  /** Short-hand for accessing the default remote configuration. */
  remoteConfig = this._config.github;
  /** Octokit request parameters object for targeting the configured remote. */
  remoteParams = {owner: this.remoteConfig.owner, repo: this.remoteConfig.name};
  /** Git URL that resolves to the configured repository. */
  repoGitUrl = getRepositoryGitUrl(this.remoteConfig, this.githubToken);
  /** Instance of the authenticated Github octokit API. */
  github = new GithubClient(this.githubToken);

  /** The OAuth scopes available for the provided Github token. */
  private _cachedOauthScopes: Promise<string[]>|null = null;
  /**
   * Regular expression that matches the provided Github token. Used for
   * sanitizing the token from Git child process output.
   */
  private _githubTokenRegex: RegExp|null = null;

  constructor(
      public githubToken?: string, private _config: Pick<NgDevConfig, 'github'> = getConfig(),
      private _projectRoot = getRepoBaseDir()) {
    // If a token has been specified (and is not empty), pass it to the Octokit API and
    // also create a regular expression that can be used for sanitizing Git command output
    // so that it does not print the token accidentally.
    if (githubToken != null) {
      this._githubTokenRegex = new RegExp(githubToken, 'g');
    }
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
   * info failed commands.
   */
  runGraceful(args: string[], options: SpawnSyncOptions = {}): SpawnSyncReturns<string> {
    // To improve the debugging experience in case something fails, we print all executed Git
    // commands to better understand the git actions occuring. Depending on the command being
    // executed, this debugging information should be logged at different logging levels.
    const printFn = (!GitClient.LOG_COMMANDS || options.stdio === 'ignore') ? debug : info;
    // Note that we do not want to print the token if it is contained in the command. It's common
    // to share errors with others if the tool failed, and we do not want to leak tokens.
    printFn('Executing: git', this.omitGithubTokenFromMessage(args.join(' ')));

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

  /** Gets the currently checked out branch or revision. */
  getCurrentBranchOrRevision(): string {
    const branchName = this.run(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
    // If no branch name could be resolved. i.e. `HEAD` has been returned, then Git
    // is currently in a detached state. In those cases, we just want to return the
    // currently checked out revision/SHA.
    if (branchName === 'HEAD') {
      return this.run(['rev-parse', 'HEAD']).stdout.trim();
    }
    return branchName;
  }

  /** Gets whether the current Git repository has uncommitted changes. */
  hasUncommittedChanges(): boolean {
    return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
  }

  /** Whether the repo has any local changes. */
  hasLocalChanges(): boolean {
    return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
  }

  /** Sanitizes a given message by omitting the provided Github token if present. */
  omitGithubTokenFromMessage(value: string): string {
    // If no token has been defined (i.e. no token regex), we just return the
    // value as is. There is no secret value that needs to be omitted.
    if (this._githubTokenRegex === null) {
      return value;
    }
    return value.replace(this._githubTokenRegex, '<TOKEN>');
  }

  /**
   * Checks out a requested branch or revision, optionally cleaning the state of the repository
   * before attempting the checking. Returns a boolean indicating whether the branch or revision
   * was cleanly checked out.
   */
  checkout(branchOrRevision: string, cleanState: boolean): boolean {
    if (cleanState) {
      // Abort any outstanding ams.
      this.runGraceful(['am', '--abort'], {stdio: 'ignore'});
      // Abort any outstanding cherry-picks.
      this.runGraceful(['cherry-pick', '--abort'], {stdio: 'ignore'});
      // Abort any outstanding rebases.
      this.runGraceful(['rebase', '--abort'], {stdio: 'ignore'});
      // Clear any changes in the current repo.
      this.runGraceful(['reset', '--hard'], {stdio: 'ignore'});
    }
    return this.runGraceful(['checkout', branchOrRevision], {stdio: 'ignore'}).status === 0;
  }

  /**
   * Assert the GitClient instance is using a token with permissions for the all of the
   * provided OAuth scopes.
   */
  async hasOauthScopes(testFn: OAuthScopeTestFunction): Promise<true|{error: string}> {
    const scopes = await this.getAuthScopesForToken();
    const missingScopes: string[] = [];
    // Test Github OAuth scopes and collect missing ones.
    testFn(scopes, missingScopes);
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
        `  ${GITHUB_TOKEN_SETTINGS_URL}\n\n` +
        `Alternatively, a new token can be created at: ${GITHUB_TOKEN_GENERATE_URL}\n`;

    return {error};
  }

  /**
   * Retrieve the OAuth scopes for the loaded Github token.
   **/
  private getAuthScopesForToken() {
    // If the OAuth scopes have already been loaded, return the Promise containing them.
    if (this._cachedOauthScopes !== null) {
      return this._cachedOauthScopes;
    }
    // OAuth scopes are loaded via the /rate_limit endpoint to prevent
    // usage of a request against that rate_limit for this lookup.
    return this._cachedOauthScopes = this.github.rateLimit.get().then(_response => {
      const response = _response as RateLimitResponseWithOAuthScopeHeader;
      const scopes: string = response.headers['x-oauth-scopes'] || '';
      return scopes.split(',').map(scope => scope.trim());
    });
  }
}
