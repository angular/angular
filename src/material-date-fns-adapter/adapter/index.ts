/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {DateFnsAdapter} from './date-fns-adapter';
import {MAT_DATE_FNS_FORMATS} from './date-fns-formats';

export * from './date-fns-adapter';
export * from './date-fns-formats';

@NgModule({
  providers: [
    {
      provide: DateAdapter,
      useClass: DateFnsAdapter,
      deps: [MAT_DATE_LOCALE],
    },
  ],
})
export class DateFnsModule {}

@NgModule({
  imports: [DateFnsModule],
  providers: [{provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FNS_FORMATS}],
})
export class MatDateFnsModule {}
