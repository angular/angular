/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatMenuModule} from '@angular/material-experimental/mdc-menu';
import {MdcMenuE2e} from './mdc-menu-e2e';

@NgModule({
  imports: [MatMenuModule],
  declarations: [MdcMenuE2e],
})
export class MdcMenuE2eModule {
}
