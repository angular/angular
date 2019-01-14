/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'zone.js/dist/zone-node.js';
import 'zone.js/dist/long-stack-trace-zone.js';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test.js';
import 'zone.js/dist/async-test.js';
import 'zone.js/dist/fake-async-test.js';
import 'zone.js/dist/task-tracking.js';
import 'reflect-metadata/Reflect';

// This hack is needed to get jasmine, node and zone working inside bazel.
// 1) we load `jasmine-core` which contains the ENV: it, describe etc...
const jasmineCore: any = require('jasmine-core');
// 2) We create an instance of `jasmine` ENV.
const patchedJasmine = jasmineCore.boot(jasmineCore);
// 3) Save the `jasmine` into global so that `zone.js/dist/jasmine-patch.js` can get a hold of it to
// patch it.
(global as any)['jasmine'] = patchedJasmine;
// 4) Change the `jasmine-core` to make sure that all subsequent jasmine's have the same ENV,
// otherwise the patch will not work.
//    This is needed since Bazel creates a new instance of jasmine and it's ENV and we want to make
//    sure it gets the same one.
jasmineCore.boot = function() {
  return patchedJasmine;
};
// 5) Patch jasmine ENV with code which understands ProxyZone.
import 'zone.js/dist/jasmine-patch.js';

(global as any).isNode = true;
(global as any).isBrowser = false;

import '@angular/compiler'; // For JIT mode. Must be in front of any other @angular/* imports.
// Init TestBed
import {TestBed} from '@angular/core/testing';
import {ServerTestingModule, platformServerTesting} from '@angular/platform-server/testing/src/server';
import {DominoAdapter} from '@angular/platform-server/src/domino_adapter';
import {createDocument} from 'domino';

TestBed.initTestEnvironment(ServerTestingModule, platformServerTesting());
DominoAdapter.makeCurrent();
(global as any).document =
    (DominoAdapter as any).defaultDoc || ((DominoAdapter as any).defaultDoc = createDocument());
