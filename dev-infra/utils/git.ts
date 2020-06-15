/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {graphql} from '@octokit/graphql';
import * as Octokit from '@octokit/rest';
import {spawnSync, SpawnSyncOptions, SpawnSyncReturns} from 'child_process';
import {query, types} from 'typed-graphqlify';

import {getConfig, getRepoBaseDir, NgDevConfig} from './config';
import {info, yellow} from './console';

/**
 * An object representation of a GraphQL Query to be used as a response type and to generate
 * a GraphQL query string.
 */
type GraphQLQueryObject = Parameters<typeof query>[1];
/** Parameters for a GraphQL request. */
type RequestParameters = Parameters<typeof graphql>[1];
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

/**
 * Common client for performing Git interactions.
 *
 * Takes in two optional arguements:
 *   _githubToken: the token used for authentifation in github interactions, by default empty
 *     allowing readonly actions.
 *   _config: The dev-infra configuration containing GitClientConfig information, by default
 *     loads the config from the default location.
 **/
export class GitClient {
  /** Short-hand for accessing the remote configuration. */
  remoteConfig = this._config.github;
  /** Octokit request parameters object for targeting the configured remote. */
  remoteParams = {owner: this.remoteConfig.owner, repo: this.remoteConfig.name};
  /** URL that resolves to the configured repository. */
  repoGitUrl = this.remoteConfig.useSsh ?
      `git@github.com:${this.remoteConfig.owner}/${this.remoteConfig.name}.git` :
      `https://${this._githubToken}@github.com/${this.remoteConfig.owner}/${
          this.remoteConfig.name}.git`;
  /** Instance of the authenticated Github octokit API. */
  github: GithubClient;

  /** The file path of project's root directory. */
  private _projectRoot = getRepoBaseDir();
  /**
   * Regular expression that matches the provided Github token. Used for
   * sanitizing the token from Git child process output.
   */
  private _githubTokenRegex: RegExp|null = null;

  constructor(
      private _githubToken?: string, private _config: Pick<NgDevConfig, 'github'> = getConfig()) {
    // If a token has been specified (and is not empty), pass it to the Octokit API and
    // also create a regular expression that can be used for sanitizing Git command output
    // so that it does not print the token accidentally.
    if (_githubToken != null) {
      this._githubTokenRegex = new RegExp(_githubToken, 'g');
    }

    this.github = new GithubClient(_githubToken);
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
   * Assert the GitClient instance is using a token with permissions for the all of the
   * provided OAuth scopes.
   */
  async hasOauthScopes(...requestedScopes: string[]): Promise<true|{error: string}> {
    const missingScopes: string[] = [];
    const scopes = await this.getAuthScopesForToken();
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
   * Retrieve the OAuth scopes for the loaded Github token.
   **/
  @memoize()
  private async getAuthScopesForToken() {
    // OAuth scopes are loaded via the /rate_limit endpoint to prevent
    // usage of a request against that rate_limit for this lookup.
    return this.github.rateLimit.get().then(_response => {
      const response = _response as RateLimitResponseWithOAuthScopeHeader;
      const scopes: string = response.headers['x-oauth-scopes'] || '';
      return scopes.split(',').map(scope => scope.trim());
    });
  }
}


/**
 * A Github client for interacting with the Github APIs.
 *
 * Additionally, provides convienience methods for actions which require multiple requests, or
 * would provide value from memoized style responses.
 **/
class GithubClient extends Octokit {
  /** The Github GraphQL (v4) API. */
  graqhql: GithubGraphqlClient;

  constructor(token?: string) {
    // Pass in authentication token to base Octokit class.
    super({token});

    this.hook.error('request', error => {
      // Wrap API errors in a known error class. This allows us to
      // expect Github API errors better and in a non-ambiguous way.
      throw new GithubApiRequestError(error.status, error.message);
    });

    // Create authenticated graphql client.
    this.graqhql = new GithubGraphqlClient(token);
  }

  /** Retrieve the login of the current user from Github. */
  @memoize()
  async getCurrentUser() {
    return this.graqhql.query({
      viewer: {
        login: types.string,
      }
    });
  }
}


/** A client for interacting with Github's GraphQL API. */
class GithubGraphqlClient {
  /** The Github GraphQL (v4) API. */
  private graqhql: typeof graphql;

  constructor(token?: string) {
    // Set the default headers to include authorization with the provided token for all
    // graphQL calls.
    this.graqhql = graphql.defaults({headers: {authorization: `token ${token}`}});
  }


  /** Perform a query using Github's GraphQL API. */
  async query<T extends GraphQLQueryObject>(queryObject: T, params: RequestParameters = {}) {
    const queryString = query(queryObject);
    return (await this.graqhql(queryString, params)) as typeof queryObject;
  }

  /**
   * Perform multiple queries using Github's GraphQL API to retrieve multiple pages of queried
   * information.
   **/
  async multiPageQuery<T extends GraphQLQueryObject, O extends {} = T>(
      queryObject: T, params: RequestParameters,
      processPage:
          (result: T,
           currentResult: O) => {nextCursor: string, mergedResult: O, checkNextPage: boolean}) {
    /**
     * The object to be returned after queries are completed, initially empty, to be merged into on
     * each iteration through pages.
     */
    let output: O = <O>{};
    /** Whether another page should be requested. */
    let hasNextPage = true;
    /** The cursor of the last object in the query, used as marker for the next page. */
    let cursor: string|null = null;
    while (hasNextPage) {
      /** The page of results starting at the provided cursor. */
      const results = await this.query(queryObject, {...params, cursor});
      /** The new result to be output, and the cursor of the last item in the page. */
      const {mergedResult, nextCursor, checkNextPage} = processPage(results, output);
      output = mergedResult;
      cursor = nextCursor;
      hasNextPage = checkNextPage;
    }
    return output;
  }
}


/**
 * Simple memoize decorator to returning the cached result when available on each call of decorated
 * methods.
 *
 * This is intentionally not exported as it is written for extremely simple use cases within the
 * scope the GithubClient and GitClient classes.  It is limited to only memoizing methods with no
 * parameters and makes assumptions related to this limitation.
 */
function memoize() {
  return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    /** The original decorated method, to be called directly in the closure function. */
    const originalMethod = descriptor.value;
    if (originalMethod.length >= 1) {
      // Only allow the decorator to be added on methods with no arguements as the decorator
      // does not track the parameters provided to the method to ensure the same call parameters
      // and scope occurs.
      throw Error(
          `The memoize decorator being used can only be used on methods with no arguments, it\n` +
          `was used to decorate a method with formal arguements and may cause incorrect values\n` +
          `to be returned by the method on subsequent calls.`);
    }
    /** The symbol being used to store the result in between calls. */
    let result: any;
    /**
     * The new method to be called, in place of the original, calling the original if no result
     * value is defined.
     */
    descriptor.value = function() {
      return result = result || originalMethod.apply(this, arguments);
    };
    return descriptor;
  };
}
