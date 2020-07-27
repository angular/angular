/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatMenuBar} from './menubar';
import {MatMenuBarItem} from './menubar-item';

@NgModule({
  exports: [MatMenuBar, MatMenuBarItem],
  declarations: [MatMenuBar, MatMenuBarItem],
})
export class MatMenuBarModule {}
