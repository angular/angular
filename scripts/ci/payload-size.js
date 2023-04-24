/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

// Imports
const fs = require('fs');
const path = require('path');

// Get limit file, project name and commit SHA from command line arguments.
const [, , limitFile, project, commit] = process.argv;

const THRESHOLD_BYTES = 5000;
const THRESHOLD_PERCENT = 5;

// Load sizes.
const currentSizes = JSON.parse(fs.readFileSync('/tmp/current.log', 'utf8'));
const allLimitSizes = JSON.parse(fs.readFileSync(limitFile, 'utf8'));
const limitSizes = allLimitSizes[project];

// Check current sizes against limits.
let failed = false;
const successMessages = [];
const failureMessages = [];
for (const compressionType in limitSizes) {
  if (typeof limitSizes[compressionType] === 'object') {
    const limitPerFile = limitSizes[compressionType];

    for (const filename in limitPerFile) {
      const expectedSize = limitPerFile[filename];
      const actualSize = currentSizes[`${compressionType}/${filename}`];

      if (actualSize === undefined) {
        failed = true;
        // An expected compression type/file combination is missing. Maybe the file was renamed or
        // removed. Report it as an error, so the user updates the corresponding limit file.
        console.error(
            `ERROR: Commit ${commit} ${compressionType} ${filename} measurement is missing. ` +
            'Maybe the file was renamed or removed.');
      } else {
        const absoluteSizeDiff = Math.abs(actualSize - expectedSize);
        // If size diff is larger than THRESHOLD_BYTES or THRESHOLD_PERCENT...
        if (absoluteSizeDiff > THRESHOLD_BYTES ||
            absoluteSizeDiff > (expectedSize * THRESHOLD_PERCENT / 100)) {
          failed = true;
          // We must also catch when the size is significantly lower than the payload limit, so
          // we are forced to update the expected payload number when the payload size reduces.
          // Otherwise, we won't be able to catch future regressions that happen to be below
          // the artificially inflated limit.
          const operator = actualSize > expectedSize ? 'exceeded' : 'fell below';

          failureMessages.push(
              `FAIL: Commit ${commit} ${compressionType} ${filename} ${operator} expected size by ${
                  THRESHOLD_BYTES} bytes or >${THRESHOLD_PERCENT}% ` +
              `(expected: ${expectedSize}, actual: ${actualSize}).`);
        } else {
          successMessages.push(
              `SUCCESS: Commit ${commit} ${compressionType} ${
                  filename} did NOT cross size threshold of ${THRESHOLD_BYTES} bytes or >${
                  THRESHOLD_PERCENT} ` +
              `(expected: ${expectedSize}, actual: ${actualSize}).`);
        }
      }
    }
  }
}

// Group failure messages separately from success messages so they are easier to find.
successMessages.concat(failureMessages).forEach(message => console.error(message));

if (failed) {
  const projectRoot = path.resolve(__dirname, '../..');
  const limitFileRelPath = path.relative(projectRoot, limitFile);
  console.info(
      `If this is a desired change, please update the size limits in file '${limitFileRelPath}'.`);
  process.exit(1);
} else {
  console.info(`Payload size check passed. All diffs are less than ${THRESHOLD_PERCENT}% or ${
      THRESHOLD_BYTES} bytes.`);
}
