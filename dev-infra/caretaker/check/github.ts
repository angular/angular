/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {alias, params, types} from 'typed-graphqlify';

import {bold, debug, info} from '../../utils/console';
import {GitClient} from '../../utils/git';
import {CaretakerConfig} from '../config';


interface GithubInfoQuery {
  [key: string]: {
    issueCount: number,
  };
}

/** Retrieve the number of matching issues for each github query. */
export async function printGithubTasks(git: GitClient, config: CaretakerConfig) {
  if (!config.githubQueries?.length) {
    debug('No github queries defined in the configuration, skipping.');
    return;
  }
  info.group(bold('Github Tasks'));
  await getGithubInfo(git, config);
  info.groupEnd();
  info();
}

/** Retrieve query match counts and log discovered counts to the console. */
async function getGithubInfo(git: GitClient, {githubQueries: queries = []}: CaretakerConfig) {
  /** The query object for graphql. */
  const graphQlQuery: {[key: string]: {issueCount: number}} = {};
  /** The Github search filter for the configured repository. */
  const repoFilter = `repo:${git.remoteConfig.owner}/${git.remoteConfig.name}`;
  queries.forEach(({name, query}) => {
    /** The name of the query, with spaces removed to match GraphQL requirements. */
    const queryKey = alias(name.replace(/ /g, ''), 'search');
    graphQlQuery[queryKey] = params(
        {
          type: 'ISSUE',
          query: `"${repoFilter} ${query.replace(/"/g, '\\"')}"`,
        },
        {issueCount: types.number},
    );
  });
  /** The results of the generated github query. */
  const results = await git.github.graphql.query(graphQlQuery);
  Object.values(results).forEach((result, i) => {
    info(`${queries[i]?.name.padEnd(25)} ${result.issueCount}`);
  });
}
