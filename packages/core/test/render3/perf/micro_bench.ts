/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const performance = typeof require === 'undefined' ?  //
    window.performance :                              // We are in browser
    require('perf_hooks').performance;                // We are in node

// Higher number here makes it more likely that we are more sure of the result.
const MIN_SAMPLE_COUNT_NO_IMPROVEMENT = 500;
// A smaller number here means that we are coming too close on timer resultion, but it also means
// that it is less likely that we will be bothered by GC or preemptive multi tasking.
const MIN_SAMPLE_DURATION = 3;

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

export function createBenchmark(benchmarkName: string): Benchmark {
  const profiles: Profile[] = [];

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
          // tslint:disable-next-line:no-console
          console.log(benchmarkName, profileName, '...');
        } else {
          profile.sampleCount++;
          // we came to an end of a sample, compute the time.
          const duration_ms = performance.now() - timestamp;
          const iterationTime_ms = duration_ms / profile.iterationCount;
          if (profile.bestTime > iterationTime_ms) {
            profile.bestTime = iterationTime_ms;
            profile.noImprovementCount = 0;
            runAgain = true;
          } else {
            runAgain = (profile.noImprovementCount++) < MIN_SAMPLE_COUNT_NO_IMPROVEMENT;
          }
          if (duration_ms < MIN_SAMPLE_DURATION) {
            // we have not ran for long enough so increase the iteration count.
            profile.iterationCount <<= 1;
            profile.noImprovementCount = 0;
            runAgain = true;
          }
          if (!runAgain) {
            // tslint:disable-next-line:no-console
            console.log(`  ${formatTime(profile.bestTime)} (count: ${
                profile.sampleCount}, iterations: ${profile.iterationCount})`);
          }
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
    const unitOffset = findUnit(fastest.bestTime);
    (fn || console.info)(`\nBenchmark: ${benchmarkName}\n${
        profiles
            .map((profile: Profile) => {
              const time = formatTime(profile.bestTime, unitOffset);
              const percent = formatPercent(1 - profile.bestTime / fastest.bestTime);
              return ` ${profile.profileName}: ${time}(${percent}) `;
            })
            .join('\n')}`);
  };
  return benchmark;
}

enum UNITS {
  ms = 0,
  us = 1,
  ns = 2,
  ps = 3,
}

function findUnit(time_ms: number): UNITS {
  let unitOffset = UNITS.ms;
  while (time_ms < 1 && time_ms !== 0) {
    time_ms = time_ms * 1000;
    unitOffset++;
  }
  return unitOffset;
}

function formatTime(value: number, unitOffset?: number): string {
  if (unitOffset === undefined) {
    unitOffset = findUnit(value);
  }
  const time = (value * Math.pow(1000, unitOffset)).toFixed(3);
  return time + ' ' + UNITS[unitOffset];
}

function formatPercent(value: number): string {
  return (value * 100).toFixed(0) + '%';
}
