/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A processor that will fail if there are named example regions that are not used in any docs.
 *
 * @param {*} exampleMap - contains all the regions extracted from example files.
 */
module.exports = function checkForUnusedExampleRegions(exampleMap) {
  return {
    $runAfter: ['renderExamples'],
    $runBefore: ['writing-files'],
    $process() {
      const unusedExampleRegions = [];
      for (const exampleFolder of Object.values(exampleMap)) {
        for (const exampleFile of Object.values(exampleFolder)) {
          for (const [regionName, region] of Object.entries(exampleFile.regions)) {
            if (regionName === '' || region.usedInDoc) continue;
            unusedExampleRegions.push(region);
          }
        }
      }

      if (unusedExampleRegions.length > 0) {
        const message = (unusedExampleRegions.length === 1 ?
                             'There is 1 unused example region:\n' :
                             `There are ${unusedExampleRegions.length} unused example regions:\n`) +
            unusedExampleRegions.map(region => ` - ${region.id}`).join('\n');
        throw new Error(message);
      }
    },
  };
};
