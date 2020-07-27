/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatMenuBarModule} from '@angular/material-experimental/menubar';
import {MatMenuBarDemo} from './mat-menubar-demo';

@NgModule({
  imports: [MatMenuBarModule, RouterModule.forChild([{path: '', component: MatMenuBarDemo}])],
  declarations: [MatMenuBarDemo],
})
export class MatMenuBarDemoModule {}
