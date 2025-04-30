/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'zone.js/lib/browser/rollup-main';
import './zone_base_setup';
import '@angular/compiler'; // For JIT mode. Must be in front of any other @angular/* imports.

import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

TestBed.initTestEnvironment([BrowserTestingModule, NoopAnimationsModule], platformBrowserTesting());

(window as any).isNode = false;
(window as any).isBrowser = true;
(window as any).global = window;
