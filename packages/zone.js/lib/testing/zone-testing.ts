/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// load test related files into bundle in correct order
import '../zone-spec/long-stack-trace';
import '../zone-spec/proxy';
import '../zone-spec/sync-test';
import '../jasmine/jasmine';
import '../jest/jest';
import '../mocha/mocha';
import './async-testing';
import './fake-async';
import './promise-testing';
