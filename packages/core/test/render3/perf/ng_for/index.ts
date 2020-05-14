/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as b from './benchmarks';
import {printHeading, printBenchmarkResultsTable} from './util';

async function main() {
  const suite = b.createTripleNgForBenchmarkSuite();

  await b.run(suite, 'numbers (no changes)', b.numberListNoChanges);
  await b.run(suite, 'objects (no changes)', b.objectListNoChanges);
  await b.run(suite, 'numbers (ref change)', b.numberListRefChange);
  await b.run(suite, 'objects (ref change)', b.objectListRefChange);
  await b.run(suite, 'track objects (ref change)', b.objectListRefChangeWithTrackBy);
  await b.run(suite, 'numbers (ref to [])', b.numberListToEmpty);
  await b.run(suite, 'objects (ref to [])', b.objectListToEmpty);
  await b.run(suite, 'track objects (ref to [])', b.objectListToEmptyTrackBy);

  // mutation benchmarks do not need to run scenario #2 (which is the `No Deep Watching` case)
  const skipDeepWatching = b.SuiteOptions.SkipScenario2;
  await b.run(suite, 'numbers (mutate add/remove)', b.addRemoveNumberItems, skipDeepWatching);
  await b.run(suite, 'objects (mutate add/remove)', b.addRemoveObjectItems, skipDeepWatching);
  await b.run(
      suite, 'track objects (mutate add/remove)', b.addRemoveObjectItemsTrackBy, skipDeepWatching);
  await b.run(suite, 'numbers (sort in place)', b.sortNumberItems, skipDeepWatching);
  await b.run(suite, 'objects (sort in place)', b.sortObjectItems, skipDeepWatching);
  await b.run(suite, 'track objects (sort in place)', b.sortObjectItemsTrackBy, skipDeepWatching);
  await b.run(suite, 'numbers (set length => 0)', b.truncateListOfNumbers, skipDeepWatching);
  await b.run(suite, 'objects (set length => 0)', b.truncateListOfObjects, skipDeepWatching);
  await b.run(
      suite, 'track objects (set length => 0)', b.truncateListOfObjectsTrackBy, skipDeepWatching);

  printHeading('Results');
  printBenchmarkResultsTable(suite.scenarios, suite.benchmarks, suite.entries);
}

main();
