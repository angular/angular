/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createBenchmark, Profile} from '../micro_bench';

/**
 * Benchmarking suite used to track benchmark tests for each suite that it is created with.
 *
 * The benchmarking suite is designed to be used in the following way.
 *
 * ```ts
 * const suite = new BenchmarkSuite([
 *   'my default test suite'
 * ])
 *
 * // first create a new benchmark
 * const index = suite.registerBenchmark('my benchmark');
 *
 * // then run tests
 * suite.benchmarkStart(0, index, null);
 * while (suite.benchmarkIsStillTracking()) {
 *    // do whatever needs to be done that will
 *    // be tracked by the benchmark
 * }
 * suite.benchmarkEnd();
 * ```
 */
export class BenchmarkSuite {
  public readonly entries: number[][] = [];
  public readonly benchmarks: string[] = [];

  private _currentProfile: Profile|null = null;
  private _currentScenarioIndex = -1;
  private _currentBenchmarkIndex = -1;

  constructor(public readonly scenarios: string[]) {}

  registerBenchmark(name: string) {
    const index = this.benchmarks.length;
    this.benchmarks.push(name);
    this.entries.push(new Array(this.scenarios.length))
    return index;
  }

  benchmarkStart(scenarioIndex: number, benchmarkIndex: number, testSetup: Function|null) {
    const scenarioName = this.scenarios[scenarioIndex];
    const benchmarkName = this.benchmarks[benchmarkIndex];
    this._currentProfile = createBenchmark(scenarioName, testSetup || undefined)('');
    this._currentBenchmarkIndex = benchmarkIndex;
    this._currentScenarioIndex = scenarioIndex;
    console.profile(`${scenarioName} ${benchmarkName}`);
  }

  benchmarkIsStillTracking() {
    return this._currentProfile!();
  }

  benchmarkEnd() {
    console.profileEnd();
    const value = this._currentProfile!.bestTime;
    const benchmarkIndex = this._currentBenchmarkIndex;
    const row = this.entries[benchmarkIndex]!;
    row[this._currentScenarioIndex] = value;
    this._currentBenchmarkIndex = -1;
    this._currentScenarioIndex = -1;
    this._currentProfile = null;
  }
}
