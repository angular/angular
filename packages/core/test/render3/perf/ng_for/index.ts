/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as b from './benchmarks';
import {printBenchmarkResultsTable, printHeading} from './util';

function main() {
  const suite = b.createNgForBenchmarkSuite();

  b.run(suite, 'numbers (no changes)', b.numberListNoChanges);
  b.run(suite, 'objects (no changes)', b.objectListNoChanges);
  b.run(suite, 'numbers (ref change)', b.numberListRefChange);
  b.run(suite, 'objects (ref change)', b.objectListRefChange);
  b.run(suite, 'track objects (ref change)', b.objectListRefChangeWithTrackBy);
  b.run(suite, 'numbers (ref to [])', b.numberListToEmpty);
  b.run(suite, 'objects (ref to [])', b.objectListToEmpty);
  b.run(suite, 'track objects (ref to [])', b.objectListToEmptyTrackBy);
  b.run(suite, 'numbers (mutate add/remove)', b.addRemoveNumberItems);
  b.run(suite, 'objects (mutate add/remove)', b.addRemoveObjectItems);
  b.run(suite, 'track objects (mutate add/remove)', b.addRemoveObjectItemsTrackBy);
  b.run(suite, 'numbers (sort in place)', b.sortNumberItems);
  b.run(suite, 'objects (sort in place)', b.sortObjectItems);
  b.run(suite, 'track objects (sort in place)', b.sortObjectItemsTrackBy);
  b.run(suite, 'numbers (set length => 0)', b.truncateListOfNumbers);
  b.run(suite, 'objects (set length => 0)', b.truncateListOfObjects);
  b.run(suite, 'track objects (set length => 0)', b.truncateListOfObjectsTrackBy);

  printHeading('Results');
  printBenchmarkResultsTable(suite.scenarios, suite.benchmarks, suite.entries);
}

main();
