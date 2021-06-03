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

/** A Github client for interacting with the Github APIs. */
export class GithubClient {
  /** The octokit instance actually performing API requests. */
  private _octokit = new Octokit(this._octokitOptions);

  readonly pulls = this._octokit.pulls;
  readonly repos = this._octokit.repos;
  readonly issues = this._octokit.issues;
  readonly git = this._octokit.git;
  readonly paginate = this._octokit.paginate;
  readonly rateLimit = this._octokit.rateLimit;

  constructor(private _octokitOptions?: Octokit.Options) {}
}

/**
 * Extension of the `GithubClient` that provides utilities which are specific
 * to authenticated instances.
 */
export class AuthenticatedGithubClient extends GithubClient {
  /** The graphql instance with authentication set during construction. */
  private _graphql = graphql.defaults({headers: {authorization: `token ${this._token}`}});

  constructor(private _token: string) {
    // Set the token for the octokit instance.
    super({auth: _token});
  }

  /** Perform a query using Github's Graphql API. */
  async graphql<T extends GraphqlQueryObject>(queryObject: T, params: RequestParameters = {}) {
    return (await this._graphql(query(queryObject).toString(), params)) as T;
  }
}
