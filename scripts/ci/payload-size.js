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

      if (Math.abs(actualSize - expectedSize) > expectedSize / 100) {
        failed = true;
        console.log(
            `Commit ${commit} ${compressionType} ${filename} exceeded expected size by >1% ` +
            `(expected: ${expectedSize}, actual: ${actualSize}).\n` +
            `If this is a desired change, please update the size limits in file '${limitFile}'.`);
      }
    }
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('Payload size <1% change check passed.');
}
