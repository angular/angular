/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

if (process.env['TEST_SRCDIR']) {
  // bootstrap the bazel require resolve patch since this
  // script is a bootstrap script loaded with --node_options=--require=...
  const path = require('path');
  require(path.posix.join(
      process.env['TEST_SRCDIR'], process.env['TEST_WORKSPACE'],
      (process.env['TEST_BINARY'] as string).replace(/\.(sh|bat)$/, '_loader.js'), ));
}

import 'zone.js/lib/node/rollup-main';
import 'zone.js/lib/zone-spec/long-stack-trace';
import 'zone.js/lib/zone-spec/task-tracking';
import 'zone.js/lib/zone-spec/proxy';
import 'zone.js/lib/zone-spec/sync-test';
import 'zone.js/lib/zone-spec/async-test';
import 'zone.js/lib/zone-spec/fake-async-test';
import 'reflect-metadata/Reflect';

// Initialize jasmine with @bazel/jasmine boot() function. This will initialize
// global.jasmine so that it can be patched by zone.js jasmine-patch.js.
require('@bazel/jasmine').boot();
import 'zone.js/lib/jasmine/jasmine';

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
