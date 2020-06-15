/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as b from './benchmarks';
import {printBenchmarkResultsTable, printHeading} from './util';

function main() {
  const suite = b.createTripleNgForBenchmarkSuite();

  b.run(suite, 'numbers (no changes)', b.numberListNoChanges);
  b.run(suite, 'objects (no changes)', b.objectListNoChanges);
  b.run(suite, 'numbers (ref change)', b.numberListRefChange);
  b.run(suite, 'objects (ref change)', b.objectListRefChange);
  b.run(suite, 'track objects (ref change)', b.objectListRefChangeWithTrackBy);
  b.run(suite, 'numbers (ref to [])', b.numberListToEmpty);
  b.run(suite, 'objects (ref to [])', b.objectListToEmpty);
  b.run(suite, 'track objects (ref to [])', b.objectListToEmptyTrackBy);

  // mutation benchmarks do not need to run scenario #2 (which is the `No Deep Watching` case)
  const skipDeepWatching = b.SuiteOptions.SkipScenario2;
  b.run(suite, 'numbers (mutate add/remove)', b.addRemoveNumberItems, skipDeepWatching);
  b.run(suite, 'objects (mutate add/remove)', b.addRemoveObjectItems, skipDeepWatching);
  b.run(
      suite, 'track objects (mutate add/remove)', b.addRemoveObjectItemsTrackBy, skipDeepWatching);
  b.run(suite, 'numbers (sort in place)', b.sortNumberItems, skipDeepWatching);
  b.run(suite, 'objects (sort in place)', b.sortObjectItems, skipDeepWatching);
  b.run(suite, 'track objects (sort in place)', b.sortObjectItemsTrackBy, skipDeepWatching);
  b.run(suite, 'numbers (set length => 0)', b.truncateListOfNumbers, skipDeepWatching);
  b.run(suite, 'objects (set length => 0)', b.truncateListOfObjects, skipDeepWatching);
  b.run(suite, 'track objects (set length => 0)', b.truncateListOfObjectsTrackBy, skipDeepWatching);

  printHeading('Results');
  printBenchmarkResultsTable(suite.scenarios, suite.benchmarks, suite.entries);
}

main();
