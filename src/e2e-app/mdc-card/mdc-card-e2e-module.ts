/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {MdcCardE2e} from './mdc-card-e2e';

@NgModule({
  imports: [MatCardModule],
  declarations: [MdcCardE2e],
})
export class MdcCardE2eModule {
}
