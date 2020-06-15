/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgForOf} from '@angular/common';
import {NgForOf as NgForOfPatched} from '@angular/common/src/directives/ng_for_of_patched';
import {WatchCollectionPipe} from '@angular/common/src/pipes/watch_collection_pipe';

import {BenchmarkSuite} from './benchmark_suite';
import {createFakeNgFor} from './fake_ng_for';
import {makeNumberArray, makeObjectArray, ObjectEntry, printHeading, trackByObjects, untilLessBusy} from './util';

/**
 * Creates a new benchmarking suite with three test scenarios:
 * 1. NgFor normally
 * 2. NgFor without deep watching
 * 3. NgFor without deep watching and using WatchCollection
 */
export function createTripleNgForBenchmarkSuite() {
  return new BenchmarkSuite([
    'Master',
    'No Deep Watching',
    'WatchCollection',
  ]);
}

/**
 * Runs the provided benchmark function in following suites:
 * 1. NgFor normally
 * 2. NgFor without deep watching
 * 3. NgFor without deep watching and using WatchCollection
 */
export function run(
    suite: BenchmarkSuite, benchmarkName: string, fn: BenchmarkRunFn, flags: SuiteOptions = 0) {
  const benchmarkIndex = suite.registerBenchmark(benchmarkName);
  printHeading(`Benchmark #${benchmarkIndex}: ${suite.benchmarks[benchmarkIndex]}`);

  // Test for ngFor as it currently is in master
  if (!optionIsSet(flags, SuiteOptions.SkipScenario1)) {
    fn(suite, benchmarkIndex, 0, BenchmarkFeatures.UseStandardNgFor);
  }

  // Test for ngFor without any deep watching behavior (ngForPatched allows for this)
  if (!optionIsSet(flags, SuiteOptions.SkipScenario2)) {
    fn(suite, benchmarkIndex, 1, BenchmarkFeatures.UsePatchedNgFor);
  }

  // Test for ngFor without any deep watching behavior (ngForPatched)
  // and also use the WatchCollectionPipe to enable deep watching
  // behavior
  if (!optionIsSet(flags, SuiteOptions.SkipScenario3)) {
    fn(suite, benchmarkIndex, 2, BenchmarkFeatures.UseWatchCollection);
  }
}

/**
 * Options passed in when a benchmark is run across any of the scenarios attached to the suite
 */
export enum SuiteOptions {
  SkipScenario1 = 0b001,
  SkipScenario2 = 0b010,
  SkipScenario3 = 0b100,
}

/**
 * Feature flags used for instruct what structures to load for benchmark tests
 */
enum BenchmarkFeatures {
  UseStandardNgFor = 0b000,
  UsePatchedNgFor = 0b01,
  UseWatchCollection = 0b10,
}

/**
 * The benchmark function that is run for each scenario within a benchmark suite
 */
interface BenchmarkRunFn {
  (suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
   options: BenchmarkFeatures): void;
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function numberListNoChanges(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const array = makeNumberArray();
  const wc =
      (options & BenchmarkFeatures.UseWatchCollection) === BenchmarkFeatures.UseWatchCollection ?
      new WatchCollectionPipe() :
      null;

  function testSetup() {
    updateNgForValue(ngFor, wc, array);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, wc, array);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function objectListNoChanges(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const array = makeObjectArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  function testSetup() {
    updateNgForValue(ngFor, wc, array);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, wc, array);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function numberListRefChange(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const arr1 = makeNumberArray();
  const arr2 = makeNumberArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  function testSetup() {
    updateNgForValue(ngFor, wc, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, wc, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function objectListRefChange(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const arr1 = makeObjectArray();
  const arr2 = makeObjectArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  function testSetup() {
    updateNgForValue(ngFor, wc, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, wc, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function objectListRefChangeWithTrackBy(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor =
      createFakeNgFor<ObjectEntry>(options & BenchmarkFeatures.UsePatchedNgFor, trackByObjects);
  const arr1 = makeObjectArray();
  const arr2 = makeObjectArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  function testSetup() {
    updateNgForValue(ngFor, wc, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, wc, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function numberListToEmpty(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const arr1 = makeNumberArray();
  const arr2: any[] = [];
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  function testSetup() {
    updateNgForValue(ngFor, wc, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, wc, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function objectListToEmpty(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const arr1 = makeObjectArray();
  const arr2: any[] = [];
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  function testSetup() {
    updateNgForValue(ngFor, wc, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, wc, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function objectListToEmptyTrackBy(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor =
      createFakeNgFor<ObjectEntry>(options & BenchmarkFeatures.UsePatchedNgFor, trackByObjects);
  const arr1 = makeObjectArray();
  const arr2: any[] = [];
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  function testSetup() {
    updateNgForValue(ngFor, wc, arr1);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, wc, arr2);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function addRemoveNumberItems(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const original = makeNumberArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  let arrayForTest = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, wc, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.push('a', 'b', 'c');
    updateNgForValue(ngFor, wc, arrayForTest);
    arrayForTest.pop();
    arrayForTest.pop();
    updateNgForValue(ngFor, wc, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function addRemoveObjectItems(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const original = makeObjectArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, wc, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.push({value: 1}, {value: 2}, {value: 3});
    updateNgForValue(ngFor, wc, arrayForTest);
    arrayForTest.pop();
    arrayForTest.pop();
    updateNgForValue(ngFor, wc, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function addRemoveObjectItemsTrackBy(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor =
      createFakeNgFor<ObjectEntry>(options & BenchmarkFeatures.UsePatchedNgFor, trackByObjects);
  const original = makeObjectArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, wc, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.push({value: 1}, {value: 2}, {value: 3});
    updateNgForValue(ngFor, wc, arrayForTest);
    arrayForTest.pop();
    arrayForTest.pop();
    updateNgForValue(ngFor, wc, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function benchmark5dot1(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const original = makeNumberArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  let arrayForTest: any[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, wc, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest = [...arrayForTest, 'a', 'b', 'c'];
    updateNgForValue(ngFor, wc, arrayForTest);
    arrayForTest = arrayForTest.slice(0, arrayForTest.length - 1);
    arrayForTest = arrayForTest.slice(0, arrayForTest.length - 1);
    updateNgForValue(ngFor, wc, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function sortNumberItems(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const original = makeNumberArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  let arrayForTest: number[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, wc, arrayForTest);
    arrayForTest.reverse();
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, wc, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function sortObjectItems(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const original = makeObjectArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, wc, arrayForTest);
    arrayForTest.reverse();
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, wc, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function sortObjectItemsTrackBy(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor =
      createFakeNgFor<ObjectEntry>(options & BenchmarkFeatures.UsePatchedNgFor, trackByObjects);
  const original = makeObjectArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, wc, arrayForTest);
    arrayForTest.reverse();
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    updateNgForValue(ngFor, wc, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function truncateListOfNumbers(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const original = makeNumberArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  let arrayForTest: number[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, wc, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.length = 0;
    updateNgForValue(ngFor, wc, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function truncateListOfObjects(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor = createFakeNgFor<number>(options & BenchmarkFeatures.UsePatchedNgFor, null);
  const original = makeObjectArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, wc, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.length = 0;
    updateNgForValue(ngFor, wc, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Benchmark used with NgFor, NgFor patched and WatchCollection
 */
export function truncateListOfObjectsTrackBy(
    suite: BenchmarkSuite, benchmarkIndex: number, scenarioIndex: number,
    options: BenchmarkFeatures) {
  const ngFor =
      createFakeNgFor<ObjectEntry>(options & BenchmarkFeatures.UsePatchedNgFor, trackByObjects);
  const original = makeObjectArray();
  const wc = options & BenchmarkFeatures.UseWatchCollection ? new WatchCollectionPipe() : null;

  let arrayForTest: ObjectEntry[] = [];
  function testSetup() {
    arrayForTest = [...original];
    updateNgForValue(ngFor, wc, arrayForTest);
  }

  suite.benchmarkStart(scenarioIndex, benchmarkIndex, testSetup);
  while (suite.benchmarkIsStillTracking()) {
    arrayForTest.length = 0;
    updateNgForValue(ngFor, wc, arrayForTest);
  }
  suite.benchmarkEnd();
}

/**
 * Updates the provided ngFor param with the provided collection.
 *
 * If `wc` is passed in then the provided `array` value will be transformed before
 * being assigned to `ngFor`.
 */
function updateNgForValue(
    ngFor: NgForOf<any>|NgForOfPatched<any>, wc: WatchCollectionPipe|null, array: any[]) {
  const oldValue = (ngFor as any)._ngForOf;
  const newValue = wc !== null ? wc.transform(array) : array;
  if (oldValue !== newValue) {
    ngFor.ngForOf = newValue;
  }
  ngFor.ngDoCheck();
}

function optionIsSet(value: number, option: SuiteOptions) {
  return (value & option) !== 0;
}
