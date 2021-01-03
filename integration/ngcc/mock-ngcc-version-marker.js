/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * **Usage:**
 * ```sh
 * node mock-ngcc-version-marker <entry-point> <mock-ngcc-version>
 *
 * # Example:
 * # node mock-ngcc-version-marker @angular/material/button 3.0.0
 * ```
 *
 * Ngcc marks entry-points as processed by adding marker properties in their `package.json`. It uses
 * a version as a marker in order to be able to distinguish entry-points processed by a different
 * ngcc version (e.g. an older version after an update) and perform the necessary clean-up.
 *
 * This script replaces the ngcc version marker in an entry-point's `package.json` to make it appear
 * as if it were processed by a different version of ngcc. This allows testing the clean-up logic
 * without the overhead of actually installing a different ngcc version, compiling the dependencies,
 * then installing the current version and compiling again.
 */

const {writeFileSync} = require('fs');
const {basename} = require('path');

const entryPointName = process.argv[2];
const mockNgccVersion = process.argv[3];
const actualNgccVersion = require('@angular/compiler-cli/package.json').version;

if (!entryPointName || !mockNgccVersion) {
  throw new Error(
      'Missing required argument(s).\n' +
      `Usage: node ${basename(__filename)} <entry-point> <mock-ngcc-version>\n`);
}

const entryPointPkgJsonPath = require.resolve(`${entryPointName}/package.json`);
const entryPointPkgJson = require(entryPointPkgJsonPath);
const processedMarkers = entryPointPkgJson.__processed_by_ivy_ngcc__;

Object.keys(processedMarkers).forEach(key => processedMarkers[key] = mockNgccVersion);
writeFileSync(entryPointPkgJsonPath, JSON.stringify(entryPointPkgJson, null, 2));

console.log(
    `Successfully mocked ngcc version marker in '${entryPointName}': ` +
    `${actualNgccVersion} --> ${mockNgccVersion}`);
