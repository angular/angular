/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SynonymHit} from 'algoliasearch';

/**
 * List of synonyms to upload to algolia.
 *
 * More information about synonyms can be found here:
 *    https://www.algolia.com/doc/guides/managing-results/optimize-search-results/adding-synonyms/
 */
const synonyms: SynonymHit[] = [
  {
    objectID: 'di-synonyms',
    type: 'synonym',
    synonyms: ['DI', 'dependency injection'],
  },
];

export default synonyms;
