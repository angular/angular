/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {MdcCheckboxE2e} from './mdc-checkbox-e2e';

@NgModule({
  imports: [MatCheckboxModule],
  declarations: [MdcCheckboxE2e],
})
export class MdcCheckboxE2eModule {
}
