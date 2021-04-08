/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {graphql} from '@octokit/graphql';
import * as Octokit from '@octokit/rest';
import {RequestParameters} from '@octokit/types';
import {query, types} from 'typed-graphqlify';

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
export class GithubClient extends Octokit {
  /** The current user based on checking against the Github API. */
  private _currentUser: string|null = null;
  /** The graphql instance with authentication set during construction. */
  private _graphql = graphql.defaults({headers: {authorization: `token ${this.token}`}});

  /**
   * @param token The github authentication token for Github Rest and Graphql API requests.
   */
  constructor(private token?: string) {
    // Pass in authentication token to base Octokit class.
    super({auth: token});

    this.hook.error('request', error => {
      // Wrap API errors in a known error class. This allows us to
      // expect Github API errors better and in a non-ambiguous way.
      throw new GithubApiRequestError(error.status, error.message);
    });

    // Note: The prototype must be set explictly as Github's Octokit class is a non-standard class
    // definition which adjusts the prototype chain.
    // See:
    //    https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    //    https://github.com/octokit/rest.js/blob/7b51cee4a22b6e52adcdca011f93efdffa5df998/lib/constructor.js
    Object.setPrototypeOf(this, GithubClient.prototype);
  }

  /** Perform a query using Github's Graphql API. */
  async graphql<T extends GraphqlQueryObject>(queryObject: T, params: RequestParameters = {}) {
    if (this.token === undefined) {
      throw new GithubGraphqlClientError(
          'Cannot query via graphql without an authentication token set, use the authenticated ' +
          '`GitClient` by calling `GitClient.getAuthenticatedInstance()`.');
    }
    return (await this._graphql(query(queryObject), params)) as T;
  }

  /** Retrieve the login of the current user from Github. */
  async getCurrentUser() {
    // If the current user has already been retrieved return the current user value again.
    if (this._currentUser !== null) {
      return this._currentUser;
    }
    const result = await this.graphql({
      viewer: {
        login: types.string,
      }
    });
    return this._currentUser = result.viewer.login;
  }
}
