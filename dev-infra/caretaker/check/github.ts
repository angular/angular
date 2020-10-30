/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {alias, onUnion, params, types} from 'typed-graphqlify';

import {bold, debug, info} from '../../utils/console';
import {CaretakerConfig} from '../config';
import {BaseModule} from './base';

/** A list of generated results for a github query. */
type GithubQueryResults = {
  queryName: string,
  count: number,
  queryUrl: string,
  matchedUrls: string[],
}[];

/** The fragment for a result from Github's api for a Github query. */
const GithubQueryResultFragment = {
  issueCount: types.number,
  nodes: [{...onUnion({
    PullRequest: {
      url: types.string,
    },
    Issue: {
      url: types.string,
    },
  })}],
};

/** An object containing results of multiple queries.  */
type GithubQueryResult = {
  [key: string]: typeof GithubQueryResultFragment;
};

/**
 * Cap the returned issues in the queries to an arbitrary 20. At that point, caretaker has a lot
 * of work to do and showing more than that isn't really useful.
 */
const MAX_RETURNED_ISSUES = 20;

export class GithubQueriesModule extends BaseModule<GithubQueryResults|void> {
  async retrieveData() {
    let queries = this.config.caretaker?.githubQueries!;
    if (queries === undefined || !queries?.length) {
      debug('No github queries defined in the configuration, skipping');
      return this.resolve();
    }

    /** The results of the generated github query. */
    const queryResult = await this.git.github.graphql.query(this.buildGraphqlQuery(queries));
    const results = Object.values(queryResult);

    const {owner, name: repo} = this.git.remoteConfig;

    this.resolve(results.map((result, i) => {
      return {
        queryName: queries[i].name,
        count: result.issueCount,
        queryUrl: encodeURI(`https://github.com/${owner}/${repo}/issues?q=${queries[i].query}`),
        matchedUrls: result.nodes.map(node => node.url)
      };
    }));
  }

  /** Build a Graphql query statement for the provided queries. */
  private buildGraphqlQuery(queries: NonNullable<CaretakerConfig['githubQueries']>) {
    /** The query object for graphql. */
    const graphQlQuery: GithubQueryResult = {};
    const {owner, name: repo} = this.git.remoteConfig;
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
          {...GithubQueryResultFragment});
    });

    return graphQlQuery;
  }

  async printToTerminal() {
    const queryResults = await this.data;
    if (!queryResults) {
      return;
    }
    info.group(bold('Github Tasks'));
    const minQueryNameLength = Math.max(...queryResults.map(result => result.queryName.length));
    for (const queryResult of queryResults) {
      info(`${queryResult.queryName.padEnd(minQueryNameLength)}  ${queryResult.count}`);

      if (queryResult.count > 0) {
        info.group(queryResult.queryUrl);
        queryResult.matchedUrls.forEach(url => info(`- ${url}`));
        if (queryResult.count > MAX_RETURNED_ISSUES) {
          info(`... ${queryResult.count - MAX_RETURNED_ISSUES} additional matches`);
        }
        info.groupEnd();
      }
    }
    info.groupEnd();
    info();
  }
}
