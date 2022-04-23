/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkMenuModule} from '@angular/cdk/menu';
import {MatMenuBar} from './menubar';
import {MatMenuBarItem} from './menubar-item';

@NgModule({
  imports: [CdkMenuModule],
  exports: [MatMenuBar, MatMenuBarItem],
  declarations: [MatMenuBar, MatMenuBarItem],
})
export class MatMenuBarModule {}
