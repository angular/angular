/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatButtonModule, MatListModule, MatSidenavModule} from '@angular/material';
import {DrawerDemo} from './drawer-demo';

@NgModule({
  imports: [
    MatButtonModule,
    MatListModule,
    MatSidenavModule,
  ],
  declarations: [DrawerDemo],
})
export class DrawerDemoModule {
}
