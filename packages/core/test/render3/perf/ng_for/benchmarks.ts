/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgForOf} from '@angular/common';
import {BenchmarkSuite} from './benchmark_suite';
import {createFakeNgFor} from './fake_ng_for';
import {makeNumberArray, makeObjectArray, ObjectEntry, printHeading, trackByObjects} from './util';

/**
 * Creates a new benchmarking suite with three test scenarios:
 * 1. Classic NgFor (collection watching and diffing)
 */
export function createNgForBenchmarkSuite() {
  return new BenchmarkSuite([
    'Master',
  ]);
}

/**
 * Runs the provided benchmark function in following suites:
 * 1. Classic NgFor (collection watching and diffing)
 */
export function run(suite: BenchmarkSuite, benchmarkName: string, fn: BenchmarkRunFn) {
  const benchmarkIndex = suite.registerBenchmark(benchmarkName);
  printHeading(`Benchmark #${benchmarkIndex}: ${suite.benchmarks[benchmarkIndex]}`);

  // 1. Classic NgFor scenario
  fn(suite, benchmarkIndex, 0);
}

/**
 * The benchmark function that is run for each scenario within a benchmark suite
 */
interface BenchmarkRunFn {
  (suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number): void;
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function numberListNoChanges(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const array = makeNumberArray();

  function testSetup() {
    updateNgForValue(ngFor, array);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, array);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function objectListNoChanges(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const array = makeObjectArray();

  function testSetup() {
    updateNgForValue(ngFor, array);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, array);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function numberListRefChange(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const arr1 = makeNumberArray();
  const arr2 = makeNumberArray();

  function testSetup() {
    updateNgForValue(ngFor, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function objectListRefChange(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const arr1 = makeObjectArray();
  const arr2 = makeObjectArray();

  function testSetup() {
    updateNgForValue(ngFor, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function objectListRefChangeWithTrackBy(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<ObjectEntry>(trackByObjects);
  const arr1 = makeObjectArray();
  const arr2 = makeObjectArray();

  function testSetup() {
    updateNgForValue(ngFor, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function numberListToEmpty(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const arr1 = makeNumberArray();
  const arr2: any[] = [];

  function testSetup() {
    updateNgForValue(ngFor, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function objectListToEmpty(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const arr1 = makeObjectArray();
  const arr2: any[] = [];

  function testSetup() {
    updateNgForValue(ngFor, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function objectListToEmptyTrackBy(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<ObjectEntry>(trackByObjects);
  const arr1 = makeObjectArray();
  const arr2: any[] = [];

  function testSetup() {
    updateNgForValue(ngFor, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function addRemoveNumberItems(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const original = makeNumberArray();

  let arrayForTest = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.push('a', 'b', 'c');
    updateNgForValue(ngFor, arrayForTest);
    arrayForTest.pop();
    arrayForTest.pop();
    updateNgForValue(ngFor, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function addRemoveObjectItems(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const original = makeObjectArray();

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.push({value: 1}, {value: 2}, {value: 3});
    updateNgForValue(ngFor, arrayForTest);
    arrayForTest.pop();
    arrayForTest.pop();
    updateNgForValue(ngFor, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function addRemoveObjectItemsTrackBy(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<ObjectEntry>(trackByObjects);
  const original = makeObjectArray();

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.push({value: 1}, {value: 2}, {value: 3});
    updateNgForValue(ngFor, arrayForTest);
    arrayForTest.pop();
    arrayForTest.pop();
    updateNgForValue(ngFor, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function benchmark5dot1(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const original = makeNumberArray();

  let arrayForTest: any[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest = [...arrayForTest, 'a', 'b', 'c'];
    updateNgForValue(ngFor, arrayForTest);
    arrayForTest = arrayForTest.slice(0, arrayForTest.length - 1);
    arrayForTest = arrayForTest.slice(0, arrayForTest.length - 1);
    updateNgForValue(ngFor, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function sortNumberItems(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const original = makeNumberArray();

  let arrayForTest: number[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, arrayForTest);
    arrayForTest.reverse();
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function sortObjectItems(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const original = makeObjectArray();

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, arrayForTest);
    arrayForTest.reverse();
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function sortObjectItemsTrackBy(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<ObjectEntry>(trackByObjects);
  const original = makeObjectArray();

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, arrayForTest);
    arrayForTest.reverse();
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function truncateListOfNumbers(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const original = makeNumberArray();

  let arrayForTest: number[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.length = 0;
    updateNgForValue(ngFor, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function truncateListOfObjects(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<number>(null);
  const original = makeObjectArray();

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.length = 0;
    updateNgForValue(ngFor, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor with deep watching
 */
export function truncateListOfObjectsTrackBy(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number) {
  const ngFor = createFakeNgFor<ObjectEntry>(trackByObjects);
  const original = makeObjectArray();

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.length = 0;
    updateNgForValue(ngFor, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Updates the provided ngFor param with the provided collection.
 */
function updateNgForValue(ngFor: NgForOf<any>, value: any[]) {
  const oldValue = (ngFor as any)._ngForOf;
  if (oldValue !== value) {
    ngFor.ngForOf = value;
  }
  ngFor.ngDoCheck();
}
