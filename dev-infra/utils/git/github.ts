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
 * An object representation of a GraphQL Query to be used as a response type and
 * to generate a GraphQL query string.
 */
export type GraphQLQueryObject = Parameters<typeof query>[1];

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
export class GithubGraphqlClientError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

/**
 * A Github client for interacting with the Github APIs.
 *
 * Additionally, provides convenience methods for actions which require multiple requests, or
 * would provide value from memoized style responses.
 **/
export class GithubClient extends Octokit {
  /** The current user based on checking against the Github API. */
  private _currentUser: string|null = null;
  /** The github authentication token for Github API requests. */
  private _token: string|null = null;

  constructor() {
    super();

    this.hook.error('request', error => {
      // Wrap API errors in a known error class. This allows us to
      // expect Github API errors better and in a non-ambiguous way.
      throw new GithubApiRequestError(error.status, error.message);
    });

    this.hook.before('request', async options => {
      if (this._token) {
        options.headers = {...options.headers, authorization: `token ${this._token}`};
      }
    });
    // Note: The prototype must be set explictly as Github's Octokit class is a non-standard class
    // definition which adjusts the prototype chain.
    // See:
    //    https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    //    https://github.com/octokit/rest.js/blob/7b51cee4a22b6e52adcdca011f93efdffa5df998/lib/constructor.js
    Object.setPrototypeOf(this, GithubClient.prototype);
  }

  /** Set the authentication token for using the Github REST and GraphQL APIs. */
  setAuthenticationToken(token: string) {
    this._token = token;
  }

  /** Perform a query using Github's GraphQL API. */
  async graphql<T extends GraphQLQueryObject>(
      queryObject: T, params: Omit<RequestParameters, 'headers'> = {}) {
    if (this._token === null) {
      throw new GithubGraphqlClientError(
          'Cannot query via graphql without setting the authentication token. Set the token using ' +
          '`setGithubToken()` method on `GitClient`.');
    }

    /**
     * Parameters for the graphql request, always setting the authorization header for the request.
     */
    const graphqlRequestParams: RequestParameters = {
      ...params,
      headers: {
        authorization: `token ${this._token}`,
      },
    };

    return (await graphql(query(queryObject), graphqlRequestParams)) as T;
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
