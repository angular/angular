/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {TestMainComponent} from './test-main-component';
import {TestShadowBoundary, TestSubShadowBoundary} from './test-shadow-boundary';
import {TestSubComponent} from './test-sub-component';

@NgModule({
  imports: [BrowserModule, CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [TestMainComponent, TestSubComponent, TestShadowBoundary, TestSubShadowBoundary],
  exports: [TestMainComponent, TestSubComponent, TestShadowBoundary, TestSubShadowBoundary],
  bootstrap: [TestMainComponent],
})
export class TestComponentsModule {}
