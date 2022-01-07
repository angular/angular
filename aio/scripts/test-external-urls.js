/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const {green, red} = require('chalk');
const fetch = require('node-fetch');
const {join} = require('path');

/** The full path to the contributors.json file. */
const contributorsFilePath = join(__dirname, '../content/marketing/contributors.json');


/** Verify the provided contributor websites are reachable via http(s). */
(async () => {
  /** The json object from the contributors.json file. */
  const contributorsJson = require(contributorsFilePath);
  /** The contributors flattened into an array containing the object key as a property. */
  const contributors = Object.entries(contributorsJson).map(([key, entry]) => ({key, ...entry}));
  /** Discovered contributor entries with failures loading the provided website.  */
  const failures = [];
  /** The longest discovered length of a value in the key, website or message property. */
  let padding = {key: 0, website: 0, message: 0};

  /** Adds a provided failure to the list, updating the paddings as appropriate. */
  const addFailure = (failure) => {
    padding.key = Math.max(padding.key, failure.key.length);
    padding.website = Math.max(padding.website, failure.website.length);
    padding.message = Math.max(padding.message, failure.message.length);
    failures.push(failure);
  };

  // By creating an array of Promises resolving for each attempt at checking if a contributors
  // website is reachable, these checks can be done in parallel.
  await Promise.allSettled(contributors.map(async entry => {
    // If no website is provided no check is needed.
    if (entry.website === undefined) {
      return;
    }

    // Ensure the provided website value is a valid external url serves via http or https.
    let url;
    try {
      url = new URL(entry.website);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        // Throw a generic error here to have the more specific error rethrown by the catch block.
        throw Error;
      }
    } catch {
      addFailure({...entry, message: 'Not a valid http(s) URL'});
      return;
    }

    // Check validated websites to confirm they can be reached via fetch.
    try {
      const result = await fetch(url, {method: 'HEAD'});
      if (!result.ok) {
        // If the url is for linkedin.com and the status returned is a `999`, we can assume that
        // the page is working as expected as linkedin.com returns a `999` status for
        // non-browser based requests.  Other pages returning a `999` may still indicate an
        // error in the request for the page.
        if (result.status === 999 && url.hostname.includes('linkedin.com')) {
          return;
        }

        // If the page returns a 429 for too many requests, we will assume it works and continue
        // checking in the future.
        if (result.status === 429) {
          return;
        }

        // Throw the error status a `code` to be used in the catch block.
        throw {code: result.status};
      }
    } catch (err) {
      if (err.code !== undefined) {
        addFailure({...entry, message: err.code});
      } else {
        addFailure({...entry, message: err})
      }
    }
  }));

  if (failures.length === 0) {
    console.info(green('  ✓  All websites defined in the contributors.json passed loading check.'));
  } else {
    console.group(red(`${failures.length} url(s) were unable to load:`));
    failures.forEach((failure) => {
      const key = failure.key.padEnd(padding.key);
      const website = failure.website.padEnd(padding.website);
      const message = failure.message;
      console.log(`${key}  ${website} Error: ${message}`);
    });
    console.groupEnd();
  }
})();
