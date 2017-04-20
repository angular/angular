/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, NgModule} from '@angular/core';

import {DateService} from './date_service';

@NgModule({providers: [DateService]})
export class DateServiceModule {
}
