/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';
import {FocusTrapDemo, FocusTrapShadowDomDemo, FocusTrapDialogDemo} from './focus-trap-demo';

@NgModule({
  imports: [
    A11yModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatToolbarModule,
    RouterModule.forChild([{path: '', component: FocusTrapDemo}]),
  ],
  declarations: [FocusTrapDemo, FocusTrapShadowDomDemo, FocusTrapDialogDemo],
  entryComponents: [FocusTrapDialogDemo],
})
export class FocusTrapDemoModule {
}
