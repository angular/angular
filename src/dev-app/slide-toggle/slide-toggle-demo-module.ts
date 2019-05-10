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
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {RouterModule} from '@angular/router';
import {SlideToggleDemo} from './slide-toggle-demo';

@NgModule({
  imports: [
    FormsModule,
    MatButtonModule,
    MatSlideToggleModule,
    RouterModule.forChild([{path: '', component: SlideToggleDemo}]),
  ],
  declarations: [SlideToggleDemo],
})
export class SlideToggleDemoModule {
}
