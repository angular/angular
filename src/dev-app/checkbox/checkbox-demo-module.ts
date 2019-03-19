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
import {MatCheckboxModule, MatPseudoCheckboxModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {CheckboxDemo, MatCheckboxDemoNestedChecklist} from './checkbox-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatPseudoCheckboxModule,
    RouterModule.forChild([{path: '', component: CheckboxDemo}]),
  ],
  declarations: [CheckboxDemo, MatCheckboxDemoNestedChecklist],
})
export class CheckboxDemoModule {
}
