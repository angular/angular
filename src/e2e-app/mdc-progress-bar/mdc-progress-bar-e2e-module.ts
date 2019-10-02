/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatProgressBarModule} from '@angular/material-experimental/mdc-progress-bar';
import {MdcProgressBarE2E} from './mdc-progress-bar-e2e';

@NgModule({
  imports: [MatProgressBarModule],
  declarations: [MdcProgressBarE2E],
})
export class MdcProgressBarE2eModule {
}
