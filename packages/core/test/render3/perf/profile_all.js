/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable:no-console

const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const commandLineArgs = require('command-line-args');

const baseDir = path.dirname(process.argv[1]);
const options = commandLineArgs([
  {name: 'read', alias: 'r', type: String},
  {name: 'write', alias: 'w', type: String},
]);
const readPath = options['read'];
const writePath = options['write'];

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
console.log('Building profile tests.');
const profileTestStr =
    profileTests.map((name) => `//packages/core/test/render3/perf:${name}.min_debug.es2015.js`)
        .join(' ');
shell.exec(`yarn bazel build --define=compile=aot ${profileTestStr} > /dev/null 2>&1`);

// profile tests
console.log('------------------------------------------------');
console.log('PROFILING');
console.log('------------------------------------------------');

// This stores the results of the run
const TIMES = {};


// If we have a readPath than read it into the `times`
if (readPath) {
  const json = JSON.parse(shell.cat(readPath));
  Object.keys(json).forEach((name) => {
    const run = json[name];
    TIMES[name] = {
      name: run.name,
      base_time: run.time,
      base_unit: run.unit,
    };
  });
}
profileTests.forEach((name) => {
  console.log(`Running profiling test: ${name}`);
  const log = shell.exec(
      `node dist/bin/packages/core/test/render3/perf/${name}.min_debug.es2015.js`, {silent: true});
  if (log.code != 0) throw new Error(log);
  const matches = log.stdout.match(/: ([\d\.]+) (.s)/);
  const runTime = TIMES[name] || (TIMES[name] = {name: name});
  runTime.time = Number.parseFloat(matches[1]);
  runTime.unit = matches[2];
  if (runTime.base_unit) {
    const time = runTime.time * UNITS[runTime.unit];
    const base_time = runTime.base_time * UNITS[runTime.base_unit];
    const change = (time - base_time) / base_time * 100;
    runTime['%'] = Number.parseFloat(change.toFixed(2));
  }
});
console.log('================================================');

// If we have the writePath than write the `times` to file
if (writePath) {
  const baseTimes = {};
  profileTests.forEach((name) => {
    const run = TIMES[name];
    baseTimes[name] = {
      name: run.name,
      time: run.time,
      unit: run.unit,
    };
  });
  fs.writeFileSync(writePath, JSON.stringify(baseTimes, undefined, 2));
} else {
  if (!!TIMES[Object.keys(TIMES)[0]].base_time) {
    console.table(TIMES, ['time', 'unit', 'base_time', 'base_unit', '%']);
  } else {
    console.table(TIMES, ['time', 'unit']);
  }
}
