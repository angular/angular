/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const performance = require('perf_hooks').performance;

interface Benchmark {
  (versionName: string): Profile;
  report(fn?: (report: string) => void): void;
}
interface Profile {
  (): boolean;
  profileName: string;
  run(): boolean;
  bestTime: number;
}

export function createBenchmark(
    benchmarkName: string, iterationCount: number, runs: number = 50): Benchmark {
  const profiles: Profile[] = [];

  const benchmark = function Benchmark(profileName: string): Profile {
    let iterationCounter: number = iterationCount;
    const profile: Profile = function Profile() {
      if (iterationCounter === 0) {
        iterationCounter = iterationCount;
        return false;
      } else {
        iterationCounter--;
        return true;
      }
    } as Profile;
    let lastTimestamp = 0;
    let runCount = runs;
    profile.run = function() {
      const now = performance.now();
      if (lastTimestamp !== 0) {
        const time = now - lastTimestamp;
        profile.bestTime = Math.min(profile.bestTime, time);
      }
      lastTimestamp = now;
      if (runCount === 0) {
        runCount = runs;
        return false;
      } else {
        runCount--;
        return true;
      }
    };
    profile.profileName = profileName;
    profile.bestTime = Number.MAX_SAFE_INTEGER;
    profiles.push(profile);
    return profile;
  } as Benchmark;

  benchmark.report = function(fn?: (report: string) => void) {
    setTimeout(() => {
      const fastest = profiles.reduce((previous: Profile, current: Profile) => {
        return (previous.bestTime < current.bestTime) ? previous : current;
      });
      (fn || console.log)(`Benchmark: ${benchmarkName}\n${profiles.map((profile: Profile) => {
        const percent = (100 - profile.bestTime / fastest.bestTime * 100).toFixed(0);
        return profile.profileName + ': ' + profile.bestTime.toFixed(0) + ` us(${percent} %) `;
      }).join('\n')}`);
    });
  };
  return benchmark;
}