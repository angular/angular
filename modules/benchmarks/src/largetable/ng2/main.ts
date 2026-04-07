/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {enableProdMode, provideZoneChangeDetection} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

import {init} from './init';
import {TableComponent} from './table';

enableProdMode();
bootstrapApplication(TableComponent, {
  providers: [provideZoneChangeDetection()],
}).then(init);
