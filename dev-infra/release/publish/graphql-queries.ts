/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {params, types} from 'typed-graphqlify';

/**
 * Graphql Github API query that can be used to find forks of a given repository
 * that are owned by the current viewer authenticated with the Github API.
 */
export const findOwnedForksOfRepoQuery = params(
    {
      $owner: 'String!',
      $name: 'String!',
    },
    {
      repository: params({owner: '$owner', name: '$name'}, {
        forks: params({affiliations: 'OWNER', first: 1}, {
          nodes: [{
            owner: {
              login: types.string,
            },
            name: types.string,
          }],
        }),
      }),
    });
