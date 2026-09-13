/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {enableProdMode, provideZonelessChangeDetection} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

import {BenchmarkApp} from './benchmark';
import {init} from './init';

enableProdMode();
bootstrapApplication(BenchmarkApp, {providers: [provideZonelessChangeDetection()]}).then(init);
