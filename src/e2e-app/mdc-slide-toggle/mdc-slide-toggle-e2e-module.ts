/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material-experimental/mdc-slide-toggle';
import {MdcSlideToggleE2e} from './mdc-slide-toggle-e2e';

@NgModule({
  imports: [MatSlideToggleModule],
  declarations: [MdcSlideToggleE2e],
})
export class MdcSlideToggleE2eModule {
}
