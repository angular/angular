/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

const glob = require('glob');
require('zone.js/dist/zone-node.js');
const JasmineRunner = require('jasmine');
const path = require('path');
require('zone.js/dist/long-stack-trace-zone.js');
require('zone.js/dist/task-tracking.js');
require('zone.js/dist/proxy.js');
require('zone.js/dist/sync-test.js');
require('zone.js/dist/async-test.js');
require('zone.js/dist/fake-async-test.js');
const {generateSeed} = require('../../../tools/jasmine-seed-generator');

// Let TypeScript know this is a module
export {};

const jrunner = new JasmineRunner({projectBaseDir: path.resolve(__dirname, '../../')});
(global as any)['jasmine'] = jrunner.jasmine;
require('zone.js/dist/jasmine-patch.js');

// Turn on full stack traces in errors to help debugging
(<any>Error)['stackTraceLimit'] = Infinity;

// Config the test runner
jrunner.jasmine.DEFAULT_TIMEOUT_INTERVAL = 100;
jrunner.loadConfig({
  random: true,
  spec_dir: '',
});
jrunner.seed(generateSeed('cjs-jasmine/index-tools'));
jrunner.configureDefaultReporter({showColors: process.argv.indexOf('--no-color') === -1});
jrunner.onComplete((passed: boolean) => process.exit(passed ? 0 : 1));

// Support passing multiple globs
const rootDir = process.cwd();
const globsIndex = process.argv.indexOf('--');
const globs = (globsIndex === -1) ? [process.argv[2]] : process.argv.slice(globsIndex + 1);
const specFiles = globs.map(globstr => glob.sync(globstr, {cwd: rootDir}) as string[])
                      .reduce((allPaths, paths) => allPaths.concat(paths), []);

// Load helpers and spec files
const rootDirRequire = (relativePath: string) => require(path.join(rootDir, relativePath));
specFiles.forEach(rootDirRequire);

// Run the tests
jrunner.execute();
