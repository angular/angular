/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as Octokit from '@octokit/rest';
import {spawnSync, SpawnSyncOptions, SpawnSyncReturns} from 'child_process';
import {Options as SemVerOptions, parse, SemVer} from 'semver';

import {getConfig, GithubConfig, NgDevConfig} from '../config';
import {debug, info, yellow} from '../console';
import {DryRunError, isDryRun} from '../dry-run';
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
  constructor(client: GitClient<boolean>, public args: string[]) {
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
export class GitClient<Authenticated extends boolean> {
  /*************************************************
   * Singleton definition and configuration.       *
   *************************************************/
  /** The singleton instance of the authenticated GitClient. */
  private static authenticated: GitClient<true>;
  /** The singleton instance of the unauthenticated GitClient. */
  private static unauthenticated: GitClient<false>;

  /**
   * Static method to get the singleton instance of the unauthorized GitClient, creating it if it
   * has not yet been created.
   */
  static getInstance() {
    if (!GitClient.unauthenticated) {
      GitClient.unauthenticated = new GitClient(undefined);
    }
    return GitClient.unauthenticated;
  }

  /**
   * Static method to get the singleton instance of the authenticated GitClient if it has been
   * generated.
   */
  static getAuthenticatedInstance() {
    if (!GitClient.authenticated) {
      throw Error('The authenticated GitClient has not yet been generated.');
    }
    return GitClient.authenticated;
  }

  /** Build the authenticated GitClient instance. */
  static authenticateWithToken(token: string) {
    if (GitClient.authenticated) {
      throw Error(
          'Cannot generate new authenticated GitClient after one has already been generated.');
    }
    GitClient.authenticated = new GitClient(token);
  }

  /** The configuration, containing the github specific configuration. */
  private config: NgDevConfig;
  /** Whether verbose logging of Git actions should be used. */
  private verboseLogging = true;
  /** The OAuth scopes available for the provided Github token. */
  private _cachedOauthScopes: Promise<string[]>|null = null;
  /**
   * Regular expression that matches the provided Github token. Used for
   * sanitizing the token from Git child process output.
   */
  private _githubTokenRegex: RegExp|null = null;
  /** Short-hand for accessing the default remote configuration. */
  remoteConfig: GithubConfig;
  /** Octokit request parameters object for targeting the configured remote. */
  remoteParams: {owner: string, repo: string};
  /** Instance of the Github octokit API. */
  github = new GithubClient(this.githubToken);
  /** The full path to the root of the repository base. */
  baseDir: string;

  /**
   * @param githubToken The github token used for authentication, if provided.
   * @param _config The configuration, containing the github specific configuration.
   * @param baseDir The full path to the root of the repository base.
   */
  protected constructor(public githubToken: Authenticated extends true? string: undefined,
                                                                  config?: NgDevConfig,
                                                                  baseDir?: string) {
    this.baseDir = baseDir || this.determineBaseDir();
    this.config = config || getConfig(this.baseDir);
    this.remoteConfig = this.config.github;
    this.remoteParams = {owner: this.remoteConfig.owner, repo: this.remoteConfig.name};

    // If a token has been specified (and is not empty), pass it to the Octokit API and
    // also create a regular expression that can be used for sanitizing Git command output
    // so that it does not print the token accidentally.
    if (typeof githubToken === 'string') {
      this._githubTokenRegex = new RegExp(githubToken, 'g');
    }
  }

  /** Set the verbose logging state of the GitClient instance. */
  setVerboseLoggingState(verbose: boolean): this {
    this.verboseLogging = verbose;
    return this;
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
    /** The git command to be run. */
    const gitCommand = args[0];

    if (isDryRun() && gitCommand === 'push') {
      debug(`"git push" is not able to be run in dryRun mode.`);
      throw new DryRunError();
    }

    // To improve the debugging experience in case something fails, we print all executed Git
    // commands to better understand the git actions occuring. Depending on the command being
    // executed, this debugging information should be logged at different logging levels.
    const printFn = (!this.verboseLogging || options.stdio === 'ignore') ? debug : info;
    // Note that we do not want to print the token if it is contained in the command. It's common
    // to share errors with others if the tool failed, and we do not want to leak tokens.
    printFn('Executing: git', this.omitGithubTokenFromMessage(args.join(' ')));

    const result = spawnSync('git', args, {
      cwd: this.baseDir,
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

  /** Git URL that resolves to the configured repository. */
  getRepoGitUrl() {
    return getRepositoryGitUrl(this.remoteConfig, this.githubToken);
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

  /** Gets the latest git tag on the current branch that matches SemVer. */
  getLatestSemverTag(): SemVer {
    const semVerOptions: SemVerOptions = {loose: true};
    const tags = this.runGraceful(['tag', '--sort=-committerdate', '--merged']).stdout.split('\n');
    const latestTag = tags.find((tag: string) => parse(tag, semVerOptions));

    if (latestTag === undefined) {
      throw new Error(
          `Unable to find a SemVer matching tag on "${this.getCurrentBranchOrRevision()}"`);
    }
    return new SemVer(latestTag, semVerOptions);
  }

  /** Retrieve a list of all files in the repostitory changed since the provided shaOrRef. */
  allChangesFilesSince(shaOrRef = 'HEAD'): string[] {
    return Array.from(new Set([
      ...gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=d', shaOrRef])),
      ...gitOutputAsArray(this.runGraceful(['ls-files', '--others', '--exclude-standard'])),
    ]));
  }

  /** Retrieve a list of all files currently staged in the repostitory. */
  allStagedFiles(): string[] {
    return gitOutputAsArray(
        this.runGraceful(['diff', '--name-only', '--diff-filter=ACM', '--staged']));
  }

  /** Retrieve a list of all files tracked in the repostitory. */
  allFiles(): string[] {
    return gitOutputAsArray(this.runGraceful(['ls-files']));
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

  private determineBaseDir() {
    this.setVerboseLoggingState(false);
    const {stdout, stderr, status} = this.runGraceful(['rev-parse', '--show-toplevel']);
    if (status !== 0) {
      throw Error(
          `Unable to find the path to the base directory of the repository.\n` +
          `Was the command run from inside of the repo?\n\n` +
          `ERROR:\n ${stderr}`);
    }
    this.setVerboseLoggingState(true);
    return stdout.trim();
  }
}

/**
 * Takes the output from `GitClient.run` and `GitClient.runGraceful` and returns an array of strings
 * for each new line. Git commands typically return multiple output values for a command a set of
 * strings separated by new lines.
 *
 * Note: This is specifically created as a locally available function for usage as convenience
 * utility within `GitClient`'s methods to create outputs as array.
 */
function gitOutputAsArray(gitCommandResult: SpawnSyncReturns<string>): string[] {
  return gitCommandResult.stdout.split('\n').map(x => x.trim()).filter(x => !!x);
}
