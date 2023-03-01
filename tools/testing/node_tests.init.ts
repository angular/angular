/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'zone.js/lib/node/rollup-main';
import './zone_base_setup';

(global as any).isNode = true;
(global as any).isBrowser = false;

import '@angular/compiler'; // For JIT mode. Must be in front of any other @angular/* imports.
// Init TestBed
import {TestBed} from '@angular/core/testing';
import {ServerTestingModule, platformServerTesting} from '@angular/platform-server/testing/src/server';
import {DominoAdapter} from '@angular/platform-server/src/domino_adapter';
import domino from '../../packages/platform-server/src/bundled-domino';

TestBed.initTestEnvironment(ServerTestingModule, platformServerTesting());
DominoAdapter.makeCurrent();
(global as any).document = (DominoAdapter as any).defaultDoc ||
    ((DominoAdapter as any).defaultDoc = domino.createDocument());
