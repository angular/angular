/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {RouterModule} from '@angular/router';
import {ProgressBarDemo} from './progress-bar-demo';

@NgModule({
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    RouterModule.forChild([{path: '', component: ProgressBarDemo}]),
  ],
  declarations: [ProgressBarDemo],
})
export class ProgressBarDemoModule {
}
