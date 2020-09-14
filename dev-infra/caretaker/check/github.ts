/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {alias, onUnion, params, types} from 'typed-graphqlify';

import {bold, debug, info} from '../../utils/console';
import {GitClient} from '../../utils/git/index';
import {CaretakerConfig} from '../config';

/** A list of generated results for a github query. */
type GithubQueryResults = {
  queryName: string; count: number; queryUrl: string; matchedUrls: string[];
}[];

/**
 * Cap the returned issues in the queries to an arbitrary 20. At that point, caretaker has a lot
 * of work to do and showing more than that isn't really useful.
 */
const MAX_RETURNED_ISSUES = 20;

/** Retrieve the number of matching issues for each github query. */
export async function getGithubTaskPrinter(git: GitClient, config?: CaretakerConfig) {
  if (!config?.githubQueries?.length) {
    debug('No github queries defined in the configuration, skipping');
    return;
  }
  const results = await getGithubQueryResults(git, config);

  return () => {
    info.group(bold('Github Tasks'));
    printGithubQueryResults(results);
    info.groupEnd();
    info();
  };
}


/** Retrieve query match counts and log discovered counts to the console. */
async function getGithubQueryResults(
    git: GitClient, {githubQueries: queries = []}: CaretakerConfig): Promise<GithubQueryResults> {
  const {owner, name: repo} = git.remoteConfig;
  /** The query object for graphql. */
  const graphQlQuery: {
    [key: string]: {
      issueCount: number,
      nodes: Array<{url: string}>,
    }
  } = {};
  /** The Github search filter for the configured repository. */
  const repoFilter = `repo:${owner}/${repo}`;
  queries.forEach(({name, query}) => {
    /** The name of the query, with spaces removed to match GraphQL requirements. */
    const queryKey = alias(name.replace(/ /g, ''), 'search');
    graphQlQuery[queryKey] = params(
        {
          type: 'ISSUE',
          first: MAX_RETURNED_ISSUES,
          query: `"${repoFilter} ${query.replace(/"/g, '\\"')}"`,
        },
        {
          issueCount: types.number,
          nodes: [{...onUnion({
            PullRequest: {
              url: types.string,
            },
            Issue: {
              url: types.string,
            },
          })}],
        },
    );
  });
  /** The results of the generated github query. */
  const queryResult = await git.github.graphql.query(graphQlQuery);
  return Object.values(queryResult).map((result, i) => ({
                                          queryName: queries[i].name,
                                          count: result.issueCount,
                                          queryUrl: encodeURI(`https://github.com/${owner}/${
                                              repo}/issues?q=${queries[i]?.query}`),
                                          matchedUrls: result.nodes.map(node => node.url)
                                        }));
}

function printGithubQueryResults(results: GithubQueryResults) {
  const minQueryNameLength = Math.max(...results.map(result => result.queryName.length));
  for (const result of results) {
    info(`${result.queryName.padEnd(minQueryNameLength)}  ${result.count}`);

    if (result.count > 0) {
      info.group(result.queryUrl);
      result.matchedUrls.forEach(url => info(`- ${url}`));
      if (result.count > MAX_RETURNED_ISSUES) {
        info(`... ${result.count - MAX_RETURNED_ISSUES} additional matches`);
      }
      info.groupEnd();
    }
  }
}
