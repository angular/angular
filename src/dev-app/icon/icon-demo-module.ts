/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {IconDemo} from './icon-demo';

@NgModule({
  imports: [
    MatIconModule,
    RouterModule.forChild([{path: '', component: IconDemo}]),
  ],
  declarations: [IconDemo],
})
export class IconDemoModule {
}
