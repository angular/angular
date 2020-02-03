/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * **Usage:**
 * ```sh
 * node mock-ngcc-version <mock-version>
 * ```
 *
 * Ngcc marks entry-points as processed by adding marker properties in their `package.json`. It uses
 * a version as marker in order to be able to distinguish entry-points processed by a different ngcc
 * version (e.g. an older version after an update) and perform the necessary clean-up.
 *
 * This script replaces the ngcc version that is used as marker to make already processed packages
 * appear as if they were processed by a different version. This allows testing the clean-up logic
 * without the overhead of actually installing an older version, compiling the dependencies, then
 * installing the current version and compiling again.
 */

const {readFileSync, writeFileSync} = require('fs');
const {basename} = require('path');

const mockVersion = process.argv[2];
const buildMarkerPath = require.resolve('@angular/compiler-cli/ngcc/src/packages/build_marker');
const buildMarkerVersionRe = /\bNGCC_VERSION = '([^']+)';/;

if (!mockVersion) {
  throw new Error(
      'Missing required mock-version argument.\n' +
      `Usage: node ${basename(__filename)} <mock-version>\n`);
}

const originalContent = readFileSync(buildMarkerPath, 'utf8');
const originalVersionMatch = buildMarkerVersionRe.exec(originalContent);

if (originalVersionMatch === null) {
  throw new Error(`Failed to find version (${buildMarkerVersionRe}) in '${buildMarkerPath}'.`);
}

const [originalVersionAssignment, originalVersion] = originalVersionMatch;
const updatedVersionAssignment = originalVersionAssignment.replace(originalVersion, mockVersion);
const updatedContent = originalContent.replace(originalVersionAssignment, updatedVersionAssignment);

writeFileSync(buildMarkerPath, updatedContent);
console.log(`Successfully mocked ngcc version: ${originalVersion} --> ${mockVersion}`);
