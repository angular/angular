/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {graphql as unauthenticatedGraphql} from '@octokit/graphql';

import {params, query as graphqlQuery, types} from 'typed-graphqlify';
import {NgDevConfig} from './config';

/** The configuration required for github interactions. */
type GithubConfig = NgDevConfig['github'];

/**
 * Authenticated instance of Github GraphQl API service, relies on a
 * personal access token being available in the TOKEN environment variable.
 */
const graphql = unauthenticatedGraphql.defaults({
  headers: {
    // TODO(josephperrott): Remove reference to TOKEN environment variable as part of larger
    // effort to migrate to expecting tokens via GITHUB_ACCESS_TOKEN environment variables.
    authorization: `token ${process.env.TOKEN || process.env.GITHUB_ACCESS_TOKEN}`,
  }
});

/** Get a PR from github  */
export async function getPr<PrSchema>(
    prSchema: PrSchema, number: number, {owner, name}: GithubConfig) {
  const PR_QUERY = params(
      {
        $number: 'Int!',    // The PR number
        $owner: 'String!',  // The organization to query for
        $name: 'String!',   // The organization to query for
      },
      {
        repository: params({owner: '$owner', name: '$name'}, {
          pullRequest: params({number: '$number'}, prSchema),
        })
      });

  const result = await graphql(graphqlQuery(PR_QUERY), {number, owner, name}) as typeof PR_QUERY;
  return result.repository.pullRequest;
}

/** Get all pending PRs from github  */
export async function getPendingPrs<PrSchema>(prSchema: PrSchema, {owner, name}: GithubConfig) {
  // The GraphQL query object to get a page of pending PRs
  const PRS_QUERY = params(
      {
        $first: 'Int',      // How many entries to get with each request
        $after: 'String',   // The cursor to start the page at
        $owner: 'String!',  // The organization to query for
        $name: 'String!',   // The repository to query for
      },
      {
        repository: params({owner: '$owner', name: '$name'}, {
          pullRequests: params(
              {
                first: '$first',
                after: '$after',
                states: `OPEN`,
              },
              {
                nodes: [prSchema],
                pageInfo: {
                  hasNextPage: types.boolean,
                  endCursor: types.string,
                },
              }),
        })
      });
  const query = graphqlQuery('members', PRS_QUERY);

  /**
   * Gets the query and queryParams for a specific page of entries.
   */
  const queryBuilder = (count: number, cursor?: string) => {
    return {
      query,
      params: {
        after: cursor || null,
        first: count,
        owner,
        name,
      },
    };
  };

  // The current cursor
  let cursor: string|undefined;
  // If an additional page of members is expected
  let hasNextPage = true;
  // Array of pending PRs
  const prs: Array<PrSchema> = [];

  // For each page of the response, get the page and add it to the
  // list of PRs
  while (hasNextPage) {
    const {query, params} = queryBuilder(100, cursor);
    const results = await graphql(query, params) as typeof PRS_QUERY;

    prs.push(...results.repository.pullRequests.nodes);
    hasNextPage = results.repository.pullRequests.pageInfo.hasNextPage;
    cursor = results.repository.pullRequests.pageInfo.endCursor;
  }
  return prs;
}
