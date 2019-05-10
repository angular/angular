/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {ButtonDemo} from './button-demo';

@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{path: '', component: ButtonDemo}]),
  ],
  declarations: [ButtonDemo],
})
export class ButtonDemoModule {
}
