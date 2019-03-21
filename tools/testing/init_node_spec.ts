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

// We must first initialize jasmine-core before calling
// requiring `zone.js/dist/jasmine-patch.js` which patches
// jasmine ENV with code which understands ProxyZone.
// jasmine_node_test under Bazel will check if `jasmineCore.boot(jasmineCore)`
// has been called and re-use the env if it has.
// See https://github.com/bazelbuild/rules_nodejs/pull/539
const jasmineCore: any = require('jasmine-core');
jasmineCore.boot(jasmineCore);
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
