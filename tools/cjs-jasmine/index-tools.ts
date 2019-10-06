/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

const glob = require('glob');
import 'zone.js/lib/node/rollup-main';
const JasmineRunner = require('jasmine');
const path = require('path');
import 'zone.js/lib/zone-spec/long-stack-trace';
import 'zone.js/lib/zone-spec/task-tracing';
import 'zone.js/lib/zone-spec/proxy';
import 'zone.js/lib/zone-spec/sync-test';
import 'zone.js/lib/zone-spec/async-test';
import 'zone.js/lib/zone-spec/fake-async-test';
const {generateSeed} = require('../../../tools/jasmine-seed-generator');

// Let TypeScript know this is a module
export {};

const jrunner = new JasmineRunner({projectBaseDir: path.resolve(__dirname, '../../')});
(global as any)['jasmine'] = jrunner.jasmine;
import 'zone.js/lib/jasmine/jasmine';

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
