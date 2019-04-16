/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MdcButtonE2e} from './mdc-button-e2e';

@NgModule({
  imports: [MatButtonModule],
  declarations: [MdcButtonE2e],
})
export class MdcButtonE2eModule {
}
