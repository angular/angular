/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TestMainComponent} from './test-main-component';
import {TestSubComponent} from './test-sub-component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [TestMainComponent, TestSubComponent],
  exports: [TestMainComponent, TestSubComponent]
})
export class TestComponentsModule {}
