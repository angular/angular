/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'reflect-metadata';

import 'zone.js/lib/node/rollup-main';
import './zone_base_setup.mjs';

(global as any).isNode = true;
(global as any).isBrowser = false;

import '@angular/compiler'; // For JIT mode. Must be in front of any other @angular/* imports.
// Init TestBed
import {TestBed} from '@angular/core/testing';
import {ServerTestingModule, platformServerTesting} from '@angular/platform-server/testing';
import {ɵDominoAdapter as DominoAdapter} from '@angular/platform-server';
import domino from '../../packages/platform-server/src/bundled-domino';

TestBed.initTestEnvironment(ServerTestingModule, platformServerTesting());
DominoAdapter.makeCurrent();
(global as any).document =
  (DominoAdapter as any).defaultDoc ||
  ((DominoAdapter as any).defaultDoc = domino.createDocument());
