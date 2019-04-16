/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatRadioModule} from '@angular/material-experimental/mdc-radio';
import {MdcRadioE2e} from './mdc-radio-e2e';

@NgModule({
  imports: [MatRadioModule],
  declarations: [MdcRadioE2e],
})
export class MdcRadioE2eModule {
}
