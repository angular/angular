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

/**
 * A Github client for interacting with the Github APIs.
 *
 * Additionally, provides convenience methods for actions which require multiple requests, or
 * would provide value from memoized style responses.
 **/
export class GithubClient extends Octokit {
  /** The Github GraphQL (v4) API. */
  graphql: GithubGraphqlClient;

  /** The current user based on checking against the Github API. */
  private _currentUser: string|null = null;

  constructor(token?: string) {
    // Pass in authentication token to base Octokit class.
    super({auth: token});

    this.hook.error('request', error => {
      // Wrap API errors in a known error class. This allows us to
      // expect Github API errors better and in a non-ambiguous way.
      throw new GithubApiRequestError(error.status, error.message);
    });

    // Create authenticated graphql client.
    this.graphql = new GithubGraphqlClient(token);
  }

  /** Retrieve the login of the current user from Github. */
  async getCurrentUser() {
    // If the current user has already been retrieved return the current user value again.
    if (this._currentUser !== null) {
      return this._currentUser;
    }
    const result = await this.graphql.query({
      viewer: {
        login: types.string,
      }
    });
    return this._currentUser = result.viewer.login;
  }
}

/**
 * An object representation of a GraphQL Query to be used as a response type and
 * to generate a GraphQL query string.
 */
export type GraphQLQueryObject = Parameters<typeof query>[1];

/** A client for interacting with Github's GraphQL API. */
export class GithubGraphqlClient {
  /** The Github GraphQL (v4) API. */
  private graqhql = graphql;

  constructor(token?: string) {
    // Set the default headers to include authorization with the provided token for all
    // graphQL calls.
    if (token) {
      this.graqhql = this.graqhql.defaults({headers: {authorization: `token ${token}`}});
    }
  }

  /** Perform a query using Github's GraphQL API. */
  async query<T extends GraphQLQueryObject>(queryObject: T, params: RequestParameters = {}) {
    const queryString = query(queryObject);
    return (await this.graqhql(queryString, params)) as T;
  }
}
