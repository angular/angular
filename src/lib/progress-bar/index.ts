/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdCommonModule} from '../core';
import {MdProgressBar} from './progress-bar';


@NgModule({
  imports: [CommonModule, MdCommonModule],
  exports: [MdProgressBar, MdCommonModule],
  declarations: [MdProgressBar],
})
export class MdProgressBarModule {}


export * from './progress-bar';
