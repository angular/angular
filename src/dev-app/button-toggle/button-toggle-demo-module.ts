/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonToggleModule, MatCheckboxModule, MatIconModule} from '@angular/material';
import {ButtonToggleDemo} from './button-toggle-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  declarations: [ButtonToggleDemo],
})
export class ButtonToggleDemoModule {
}
