/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatTabsModule} from '@angular/material-experimental/mdc-tabs';
import {MdcTabsE2e} from './mdc-tabs-e2e';

@NgModule({
  imports: [MatTabsModule],
  declarations: [MdcTabsE2e],
})
export class MdcTabsE2eModule {
}
