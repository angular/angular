/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule, MatSlideToggleModule} from '@angular/material';
import {SlideToggleDemo} from './slide-toggle-demo';

@NgModule({
  imports: [
    FormsModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  declarations: [SlideToggleDemo],
})
export class SlideToggleDemoModule {
}
