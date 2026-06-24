/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {algoliasearch} from 'algoliasearch';
import synonyms from './algolia-synonyms.mjs';

/** The name of the index being updated. */
const INDEX_NAME = 'angular_v17';
/** The api key for making the change on the algolia index. */
const ALGOLIA_KEY = process.env['ALGOLIA_KEY'];
/** The algolia application id. */
const APP_NAME = 'L1XWT2UJ7F';

async function main() {
  try {
    if (ALGOLIA_KEY === undefined) {
      throw new Error('Missing required environment variable: `ALGOLIA_KEY`');
    }
    const client = algoliasearch(APP_NAME, ALGOLIA_KEY);

    // Obtain and list all of the previous synonyms for record keeping.
    const {hits: oldHits, nbHits} = await client.searchSynonyms({indexName: INDEX_NAME});
    // The list of previous synonyms cleaned to only include the information we store locally.
    const oldSynonyms = oldHits.map(({objectID, type, synonyms}) => ({objectID, type, synonyms}));

    // Delete all of the current synonyms
    await client.clearSynonyms({indexName: INDEX_NAME, forwardToReplicas: true});
    console.info(`Deleted ${nbHits} synonym(s)`);

    // Upload our new synonyms
    await client.saveSynonyms({
      indexName: INDEX_NAME,
      replaceExistingSynonyms: true,
      forwardToReplicas: true,
      synonymHit: synonyms,
    });
    console.info(`Uploaded ${synonyms.length} new synonym(s)`);

    // List both the old and new synonyms for easier comparison in debugging.
    console.info(`Previous Synonyms:`);
    console.info(JSON.stringify(oldSynonyms, undefined, 2));
    console.info(`New Synonyms:`);
    console.info(JSON.stringify(synonyms, undefined, 2));

    console.info('\nSuccessfully updated synonyms');
  } catch (error) {
    console.error('\nError updating synonyms:');
    console.error(error);
    process.exit(1);
  }
}

main();
