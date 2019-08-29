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
require('source-map-support').install();
require('zone.js/dist/long-stack-trace-zone.js');
require('zone.js/dist/task-tracking.js');
require('zone.js/dist/proxy.js');
require('zone.js/dist/sync-test.js');
require('zone.js/dist/async-test.js');
require('zone.js/dist/fake-async-test.js');
require('reflect-metadata/Reflect');
const {generateSeed} = require('../../../tools/jasmine-seed-generator');

// Let TypeScript know this is a module
export {};

const jrunner = new JasmineRunner({projectBaseDir: path.resolve(__dirname, '../../')});
(global as any)['jasmine'] = jrunner.jasmine;
require('zone.js/dist/jasmine-patch.js');

(global as any).isBrowser = false;
(global as any).isNode = true;

// Turn on full stack traces in errors to help debugging
(<any>Error)['stackTraceLimit'] = Infinity;

// Config the test runner
jrunner.jasmine.DEFAULT_TIMEOUT_INTERVAL = 100;
jrunner.loadConfig({
  random: true,
  spec_dir: '',
});
jrunner.seed(generateSeed('cjs-jasmine/index'));
jrunner.configureDefaultReporter({showColors: process.argv.indexOf('--no-color') === -1});
jrunner.onComplete((passed: boolean) => process.exit(passed ? 0 : 1));

// Support passing multiple globs
const distAll = process.cwd() + '/dist/all';
const globsIndex = process.argv.indexOf('--');
const globs = (globsIndex === -1) ? [process.argv[2]] : process.argv.slice(globsIndex + 1);
const specFiles =
    globs
        .map(globstr => glob.sync(globstr, {
          cwd: distAll,
          ignore: [
            // the following code and tests are not compatible with CJS/node environment
            '@angular/_testing_init/**',
            '@angular/compiler/test/aot/**',
            '@angular/compiler/test/render3/**',
            '@angular/compiler-cli/test/compliance/**',
            '@angular/core/test/bundling/**',
            '@angular/core/test/fake_async_spec.*',
            '@angular/core/test/render3/**',
            '@angular/core/test/zone/**',
            '@angular/elements/**',
            '@angular/examples/**',
            '@angular/forms/test/**',
            '@angular/integration_test/symbol_inspector/**',
            '@angular/platform-browser/**',
            '@angular/platform-browser-dynamic/**',
            '@angular/router/test/integration/bootstrap_spec.*',
            '@angular/router/test/route_config/route_config_spec.*',
            '@angular/upgrade/**',
            '@angular/**/e2e_test/**',
            'angular1_router/**',
            'payload_tests/**',
          ],
        }) as string[])
        // Run relevant subset of browser tests for features reused on the server side.
        // Make sure the security spec works on the server side!
        .concat(glob.sync('@angular/platform-browser/test/security/**/*_spec.js', {cwd: distAll}))
        .concat(['/@angular/platform-browser/test/browser/meta_spec.js'])
        .concat(['/@angular/platform-browser/test/browser/title_spec.js'])
        .concat(['/@angular/platform-browser/test/browser/transfer_state_spec.js'])
        .reduce((allPaths, paths) => allPaths.concat(paths), []);

// Load helpers and spec files
const distAllRequire = (relativePath: string) => {
  const mod = require(path.join(distAll, relativePath));
  if (mod.main) {
    mod.main();
  }
  return mod;
};
require('./test-cjs-main');
distAllRequire('@angular/platform-server/src/domino_adapter').DominoAdapter.makeCurrent();
specFiles.forEach(distAllRequire);

// Run the tests
jrunner.execute();
