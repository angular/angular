/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {params, types} from 'typed-graphqlify';
import {AuthenticatedGitClient} from './git/authenticated-git-client';


/** Get a PR from github  */
export async function getPr<PrSchema>(
    prSchema: PrSchema, prNumber: number, git: AuthenticatedGitClient) {
  /** The owner and name of the repository */
  const {owner, name} = git.remoteConfig;
  /** The Graphql query object to get a the PR */
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

  const result = (await git.github.graphql(PR_QUERY, {number: prNumber, owner, name}));
  return result.repository.pullRequest;
}

/** Get all pending PRs from github  */
export async function getPendingPrs<PrSchema>(prSchema: PrSchema, git: AuthenticatedGitClient) {
  /** The owner and name of the repository */
  const {owner, name} = git.remoteConfig;
  /** The Graphql query object to get a page of pending PRs */
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
  /** The current cursor */
  let cursor: string|undefined;
  /** If an additional page of members is expected */
  let hasNextPage = true;
  /** Array of pending PRs */
  const prs: Array<PrSchema> = [];

  // For each page of the response, get the page and add it to the list of PRs
  while (hasNextPage) {
    const params = {
      after: cursor || null,
      first: 100,
      owner,
      name,
    };
    const results = await git.github.graphql(PRS_QUERY, params) as typeof PRS_QUERY;
    prs.push(...results.repository.pullRequests.nodes);
    hasNextPage = results.repository.pullRequests.pageInfo.hasNextPage;
    cursor = results.repository.pullRequests.pageInfo.endCursor;
  }
  return prs;
}
