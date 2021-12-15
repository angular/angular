/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const shell = require('shelljs');
const fs = require('fs');
const path = require('path');

const argv = process.argv;
const baseDir = path.dirname(argv[1]);
const readPath = argv[2] == '--read' ? argv[3] : null;
const writePath = argv[2] == '--write' ? argv[3] : null;

const UNITS = {
  'ps': 1e-12,
  'ns': 1e-9,
  'us': 1e-6,
  'ms': 1e-3,
  's': 1,
};

// Contains the list of tests which should be built and profiled
const profileTests =
    shell.ls(baseDir).filter((filename) => fs.statSync(path.join(baseDir, filename)).isDirectory());

// build tests
shell.exec(
    `yarn bazel build ` +
    profileTests.map((name) => `//packages/core/test/render3/perf:${name}_lib.debug.min.js`)
        .join(' '));

// profile tests
// tslint:disable-next-line:no-console
console.log('------------------------------------------------');
// tslint:disable-next-line:no-console
console.log('PROFILING');
// tslint:disable-next-line:no-console
console.log('------------------------------------------------');

// This stores the results of the run
const times = {};


// If we have a readPath than read it into the `times`
if (readPath) {
  const json = JSON.parse(shell.cat(readPath));
  Object.keys(json).forEach((name) => {
    const run = json[name];
    times[name] = {
      name: run.name,
      base_time: run.time,
      base_unit: run.unit,
    };
  });
}
profileTests.forEach((name) => {
  // tslint:disable-next-line:no-console
  console.log('----------------', name, '----------------');
  const log = shell.exec(`node dist/bin/packages/core/test/render3/perf/${name}_lib.debug.min.js`);
  if (log.code != 0) throw new Error(log);
  const matches = log.stdout.match(/: ([\d\.]+) (.s)/);
  const runTime = times[name] || (times[name] = {name: name});
  runTime.time = Number.parseFloat(matches[1]);
  runTime.unit = matches[2];
  if (runTime.base_unit) {
    const time = runTime.time * UNITS[runTime.unit];
    const base_time = runTime.base_time * UNITS[runTime.base_unit];
    const change = (time - base_time) / base_time * 100;
    runTime['%'] = Number.parseFloat(change.toFixed(2));
  }
});
// tslint:disable-next-line:no-console
console.log('================================================');

// If we have the writePath than write the `times` to file
if (writePath) {
  const baseTimes = {};
  profileTests.forEach((name) => {
    const run = times[name];
    baseTimes[name] = {
      name: run.name,
      time: run.time,
      unit: run.unit,
    };
  });
  fs.writeFileSync(writePath, JSON.stringify(baseTimes, undefined, 2));
}

// Pretty print the table with the run information
// tslint:disable-next-line:no-console
console.table(times, ['time', 'unit', 'base_time', 'base_unit', '%']);
