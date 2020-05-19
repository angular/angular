/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This script gets contribution stats for all members of the angular org,
 * since a provided date.
 * The script expects the following flag(s):
 *
 * required:
 *   --since [date] The data after which contributions are queried for.
 *       Uses githubs search format for dates, e.g. "2020-01-21".
 *       See
 * https://help.github.com/en/github/searching-for-information-on-github/understanding-the-search-syntax#query-for-dates
 *
 * optional:
 *  --use-created [boolean] If the created timestamp should be used for
 *     time comparisons, defaults otherwise to the updated timestamp.
 */

import {graphql as unauthenticatedGraphql} from '@octokit/graphql';
import * as minimist from 'minimist';
import {alias, params, query as graphqlQuery, types} from 'typed-graphqlify';

// The organization to be considered for the queries.
const ORG = 'angular';
// The repositories to be considered for the queries.
const REPOS = ['angular', 'components', 'angular-cli'];

/**
 * Handle flags for the script.
 */
const args = minimist(process.argv.slice(2), {
  string: ['since'],
  boolean: ['use-created'],
  unknown: (option: string) => {
    console.error(`Unknown option: ${option}`);
    process.exit(1);
  }
});

if (!args['since']) {
  console.error(`Please provide --since [date]`);
  process.exit(1);
}

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

/**
 * Retrieves all current members of an organization.
 */
async function getAllOrgMembers() {
  // The GraphQL query object to get a page of members of an organization.
  const MEMBERS_QUERY = params(
      {
        $first: 'Int',      // How many entries to get with each request
        $after: 'String',   // The cursor to start the page at
        $owner: 'String!',  // The organization to query for
      },
      {
        organization: params({login: '$owner'}, {
          membersWithRole: params(
              {
                first: '$first',
                after: '$after',
              },
              {
                nodes: [{login: types.string}],
                pageInfo: {
                  hasNextPage: types.boolean,
                  endCursor: types.string,
                },
              }),
        })
      });
  const query = graphqlQuery('members', MEMBERS_QUERY);

  /**
   * Gets the query and queryParams for a specific page of entries.
   */
  const queryBuilder = (count: number, cursor?: string) => {
    return {
      query,
      params: {
        after: cursor || null,
        first: count,
        owner: ORG,
      },
    };
  };

  // The current cursor
  let cursor = undefined;
  // If an additional page of members is expected
  let hasNextPage = true;
  // Array of Github usernames of the organization
  const members: string[] = [];

  while (hasNextPage) {
    const {query, params} = queryBuilder(100, cursor);
    const results = await graphql(query, params) as typeof MEMBERS_QUERY;

    results.organization.membersWithRole.nodes.forEach(
        (node: {login: string}) => members.push(node.login));
    hasNextPage = results.organization.membersWithRole.pageInfo.hasNextPage;
    cursor = results.organization.membersWithRole.pageInfo.endCursor;
  }
  return members.sort();
}

/**
 * Build metadata for making requests for a specific user and date.
 *
 * Builds GraphQL query string, Query Params and Labels for making queries to GraphQl.
 */
function buildQueryAndParams(username: string, date: string) {
  // Whether the updated or created timestamp should be used.
  const updatedOrCreated = args['use-created'] ? 'created' : 'updated';
  let dataQueries: {[key: string]: {query: string, label: string}} = {};
  // Add queries and params for all values queried for each repo.
  for (let repo of REPOS) {
    dataQueries = {
      ...dataQueries,
      [`${repo.replace(/[\/\-]/g, '_')}_issue_author`]: {
        query: `repo:${ORG}/${repo} is:issue author:${username} ${updatedOrCreated}:>${date}`,
        label: `${ORG}/${repo} Issue Authored`,
      },
      [`${repo.replace(/[\/\-]/g, '_')}_issues_involved`]: {
        query: `repo:${ORG}/${repo} is:issue -author:${username} involves:${username} ${
            updatedOrCreated}:>${date}`,
        label: `${ORG}/${repo} Issue Involved`,
      },
      [`${repo.replace(/[\/\-]/g, '_')}_pr_author`]: {
        query: `repo:${ORG}/${repo} is:pr author:${username} ${updatedOrCreated}:>${date}`,
        label: `${ORG}/${repo} PR Author`,
      },
      [`${repo.replace(/[\/\-]/g, '_')}_pr_involved`]: {
        query: `repo:${ORG}/${repo} is:pr involves:${username} ${updatedOrCreated}:>${date}`,
        label: `${ORG}/${repo} PR Involved`,
      },
      [`${repo.replace(/[\/\-]/g, '_')}_pr_reviewed`]: {
        query: `repo:${ORG}/${repo} is:pr -author:${username} reviewed-by:${username} ${
            updatedOrCreated}:>${date}`,
        label: `${ORG}/${repo} PR Reviewed`,
      },
      [`${repo.replace(/[\/\-]/g, '_')}_pr_commented`]: {
        query: `repo:${ORG}/${repo} is:pr -author:${username} commenter:${username} ${
            updatedOrCreated}:>${date}`,
        label: `${ORG}/${repo} PR Commented`,
      },
    };
  }
  // Add queries and params for all values queried for the org.
  dataQueries = {
    ...dataQueries,
    [`${ORG}_org_issue_author`]: {
      query: `org:${ORG} is:issue author:${username} ${updatedOrCreated}:>${date}`,
      label: `${ORG} org Issue Authored`,
    },
    [`${ORG}_org_issues_involved`]: {
      query: `org:${ORG} is:issue -author:${username} involves:${username} ${updatedOrCreated}:>${
          date}`,
      label: `${ORG} org Issue Involved`,
    },
    [`${ORG}_org_pr_author`]: {
      query: `org:${ORG} is:pr author:${username} ${updatedOrCreated}:>${date}`,
      label: `${ORG} org PR Author`,
    },
    [`${ORG}_org_pr_involved`]: {
      query: `org:${ORG} is:pr involves:${username} ${updatedOrCreated}:>${date}`,
      label: `${ORG} org PR Involved`,
    },
    [`${ORG}_org_pr_reviewed`]: {
      query: `org:${ORG} is:pr -author:${username} reviewed-by:${username} ${updatedOrCreated}:>${
          date}`,
      label: `${ORG} org PR Reviewed`,
    },
    [`${ORG}_org_pr_commented`]: {
      query:
          `org:${ORG} is:pr -author:${username} commenter:${username} ${updatedOrCreated}:>${date}`,
      label: `${ORG} org PR Commented`,
    },
  };

  /**
   * Gets the labels for each requested value to be used as headers.
   */
  function getLabels(pairs: typeof dataQueries) {
    return Object.values(pairs).map(val => val.label);
  }

  /**
   * Gets the graphql query object for the GraphQL query.
   */
  function getQuery(pairs: typeof dataQueries) {
    const output: {[key: string]: {}} = {};
    Object.entries(pairs).map(([key, val]) => {
      output[alias(key, 'search')] = params(
          {
            query: `"${val.query}"`,
            type: 'ISSUE',
          },
          {
            issueCount: types.number,
          });
    });
    return output;
  }

  return {
    query: graphqlQuery(getQuery(dataQueries)),
    labels: getLabels(dataQueries),
  };
}

/**
 * Runs the script to create a CSV string with the requested data for each member
 * of the organization.
 */
async function run(date: string) {
  try {
    const allOrgMembers = await getAllOrgMembers();
    console.info(['Username', ...buildQueryAndParams('', date).labels].join(','));

    for (const username of allOrgMembers) {
      const results = await graphql(buildQueryAndParams(username, date).query);
      const values = Object.values(results).map(result => `${result.issueCount}`);
      console.info([username, ...values].join(','));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

run(args['since']);
