/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatChipsModule} from '@angular/material-experimental/mdc-chips';
import {MdcChipsE2e} from './mdc-chips-e2e';

@NgModule({
  imports: [MatChipsModule],
  declarations: [MdcChipsE2e],
})
export class MdcChipsE2eModule {
}
