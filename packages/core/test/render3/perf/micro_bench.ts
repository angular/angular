/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const performance = require('perf_hooks').performance;

const MIN_SAMPLE_COUNT_NO_IMPROVEMENT = 10;
const MIN_SAMPLE_DURATION = 100;

const UNITS = ['ms', 'us', 'ns', 'ps'];
export interface Benchmark {
  (versionName: string): Profile;
  report(fn?: (report: string) => void): void;
}
export interface Profile {
  (): boolean;
  profileName: string;
  bestTime: number;
  iterationCount: number;
  sampleCount: number;
  noImprovementCount: number;
}

let emptyLoopCost_ms = -1;

export function createBenchmark(benchmarkName: string): Benchmark {
  const profiles: Profile[] = [];

  if (emptyLoopCost_ms === -1) {
    emptyLoopCost_ms = 0;  // prevent infinite loop
    const noop = createBenchmark('empty')('noop');
    while (noop()) {
    }
    emptyLoopCost_ms = noop.bestTime;
  }

  const benchmark = function Benchmark(profileName: string): Profile {
    let iterationCounter: number = 0;
    let timestamp: number = 0;
    const profile: Profile = function Profile() {
      if (iterationCounter === 0) {
        let runAgain = false;
        // if we reached the end of the iteration count than we should decide what to do next.
        if (timestamp === 0) {
          // this is the first time we are executing
          iterationCounter = profile.iterationCount;
          runAgain = true;
        } else {
          profile.sampleCount++;
          // we came to an end of a sample, compute the time.
          const duration_ms = performance.now() - timestamp;
          const iterationTime_ms =
              Math.max((duration_ms / profile.iterationCount) - emptyLoopCost_ms, 0);
          if (profile.bestTime > iterationTime_ms) {
            profile.bestTime = iterationTime_ms;
            profile.noImprovementCount = 0;
            runAgain = true;
          } else {
            runAgain = (profile.noImprovementCount++) < MIN_SAMPLE_COUNT_NO_IMPROVEMENT;
          }
          if (duration_ms < MIN_SAMPLE_DURATION) {
            // we have not ran for long enough so increase the iteration count.
            profile.iterationCount = Math.max(
                // As a sanity if duration_ms is 0 just double the count.
                profile.iterationCount << 1,
                // Otherwise try to guess how many iterations we have to do to get the right time.
                Math.round(MIN_SAMPLE_DURATION / duration_ms * profile.iterationCount));
            profile.noImprovementCount = 0;
            runAgain = true;
          }
          // console.log('   Sample count:', profile.sampleCount, 'iterations',
          // profile.iterationCount, 'time (ms):',  iterationTime_ms);
        }
        iterationCounter = profile.iterationCount;
        timestamp = performance.now();
        return runAgain;
      } else {
        // this is the common path and it needs te be quick!
        iterationCounter--;
        return true;
      }
    } as Profile;
    profile.profileName = profileName;
    profile.bestTime = Number.MAX_SAFE_INTEGER;
    profile.iterationCount = 1;
    profile.noImprovementCount = 0;
    profile.sampleCount = 0;
    profiles.push(profile);
    return profile;
  } as Benchmark;

  benchmark.report = function(fn?: (report: string) => void) {
    const fastest = profiles.reduce((previous: Profile, current: Profile) => {
      return (previous.bestTime < current.bestTime) ? previous : current;
    });
    let unitOffset = 0;
    let time = fastest.bestTime;
    while (time < 1 && time !== 0) {
      time = time * 1000;
      unitOffset++;
    }
    let unit: string = UNITS[unitOffset];
    (fn || console.log)(`Benchmark: ${benchmarkName}\n${profiles.map((profile: Profile) => {
      const time = (profile.bestTime * Math.pow(1000, unitOffset)).toFixed(3);
      const percent = (100 - profile.bestTime / fastest.bestTime * 100).toFixed(0);
      return '  ' + profile.profileName + ': ' + time + ' ' +unit + '(' + percent + '%)';
    }).join('\n')}`);
  };
  return benchmark;
}