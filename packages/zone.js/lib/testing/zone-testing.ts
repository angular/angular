/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// load test related files into bundle in correct order
import '../zone-spec/long-stack-trace.js';
import '../zone-spec/proxy.js';
import '../zone-spec/sync-test.js';
import '../jasmine/jasmine.js';
import '../jest/jest.js';
import '../mocha/mocha.js';
import './async-testing.js';
import './fake-async.js';
import './promise-testing.js';
