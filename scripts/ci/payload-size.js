'use strict';

// Imports
const fs = require('fs');

// Get branch and project name from command line arguments.
const [, , limitFile, project, branch, commit] = process.argv;

// Load sizes.
const currentSizes = JSON.parse(fs.readFileSync('/tmp/current.log', 'utf8'));
const allLimitSizes = JSON.parse(fs.readFileSync(limitFile, 'utf8'));
const limitSizes = allLimitSizes[project][branch] || allLimitSizes[project]['master'];

// Check current sizes against limits.
let failed = false;
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
        console.log(
            `Commit ${commit} ${compressionType} ${filename} meassurement is missing. ` +
            'Maybe the file was renamed or removed.');
      } else if (Math.abs(actualSize - expectedSize) > expectedSize / 100) {
        failed = true;
        // We must also catch when the size is significantly lower than the payload limit, so
        // we are forced to update the expected payload number when the payload size reduces.
        // Otherwise, we won't be able to catch future regressions that happen to be below
        // the artificially inflated limit.
        const operator = actualSize > expectedSize ? 'exceeded' : 'fell below';
        console.log(
            `Commit ${commit} ${compressionType} ${filename} ${operator} expected size by >1% ` +
            `(expected: ${expectedSize}, actual: ${actualSize}).`);
      }
    }
  }
}

if (failed) {
  console.log(`If this is a desired change, please update the size limits in file '${limitFile}'.`);
  process.exit(1);
} else {
  console.log('Payload size <1% change check passed.');
}
