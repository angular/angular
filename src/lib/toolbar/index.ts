/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdCommonModule} from '../core';
import {MdToolbar, MdToolbarRow} from './toolbar';


@NgModule({
  imports: [MdCommonModule],
  exports: [MdToolbar, MdToolbarRow, MdCommonModule],
  declarations: [MdToolbar, MdToolbarRow],
})
export class MdToolbarModule {}


export * from './toolbar';
