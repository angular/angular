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
 * node mock-ngcc-version
 *
 * # or
 *
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

const mockVersion = process.argv[2] || 'MOCK.VERSION';
const buildMarkerPath = require.resolve('@angular/compiler-cli/ngcc/src/packages/build_marker');
const buildMarkerVersionRe = /\bNGCC_VERSION = '([^']+)';/;

const oldContent = readFileSync(buildMarkerPath, 'utf8');
const oldVersionMatch = buildMarkerVersionRe.exec(oldContent);

if (oldVersionMatch === null) {
  throw new Error(`Failed to find version (${buildMarkerVersionRe}) in '${buildMarkerPath}'.`);
}

const [oldVersionAssignment, oldVersion] = oldVersionMatch;
const newVersionAssignment = oldVersionAssignment.replace(oldVersion, mockVersion);
const newContent = oldContent.replace(oldVersionAssignment, newVersionAssignment);

writeFileSync(buildMarkerPath, newContent);
console.log(`Successfully mocked ngcc version: ${oldVersion} --> ${mockVersion}`);
