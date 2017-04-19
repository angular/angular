/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DateService} from './date_service';
import {NgModule, Injector} from '@angular/core';

@NgModule({
  providers: [
    DateService
  ]
})
export class DateServiceModule{}
