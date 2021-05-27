/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {graphql} from '@octokit/graphql';
import {Octokit} from '@octokit/rest';
import {RequestParameters} from '@octokit/types';
import {query} from 'typed-graphqlify';

/**
 * An object representation of a Graphql Query to be used as a response type and
 * to generate a Graphql query string.
 */
export type GraphqlQueryObject = Parameters<typeof query>[1];

/** Interface describing a Github repository. */
export interface GithubRepo {
  /** Owner login of the repository. */
  owner: string;
  /** Name of the repository. */
  name: string;
}

/** Error for failed Github API requests. */
export class GithubApiRequestError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Error for failed Github API requests. */
export class GithubGraphqlClientError extends Error {}

/**
 * A Github client for interacting with the Github APIs.
 *
 * Additionally, provides convenience methods for actions which require multiple requests, or
 * would provide value from memoized style responses.
 **/
export class GithubClient {
  /** The graphql instance with authentication set during construction. */
  private _graphql = graphql.defaults({headers: {authorization: `token ${this.token}`}});
  /** The Octokit instance actually performing API requests. */
  private _octokit = new Octokit({token: this.token});

  /**
   * @param token The github authentication token for Github Rest and Graphql API requests.
   */
  constructor(private token?: string) {
    this._octokit.hook.error('request', error => {
      // Wrap API errors in a known error class. This allows us to
      // expect Github API errors better and in a non-ambiguous way.
      throw new GithubApiRequestError(error.status, error.message);
    });
  }

  /** Perform a query using Github's Graphql API. */
  async graphql<T extends GraphqlQueryObject>(queryObject: T, params: RequestParameters = {}) {
    if (this.token === undefined) {
      throw new GithubGraphqlClientError(
          'Cannot query via graphql without an authentication token set, use the authenticated ' +
          '`GitClient` by calling `GitClient.getAuthenticatedInstance()`.');
    }
    return (await this._graphql(query(queryObject).toString(), params)) as T;
  }

  pulls = this._octokit.pulls;
  repos = this._octokit.repos;
  issues = this._octokit.issues;
  git = this._octokit.git;
  paginate = this._octokit.paginate;
  rateLimit = this._octokit.rateLimit;
}
