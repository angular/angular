/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TestComponentsModule} from '@angular/cdk-experimental/testing/tests';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ComponentHarnessE2e} from './component-harness-e2e';

@NgModule({
  imports: [CommonModule, FormsModule, TestComponentsModule],
  declarations: [ComponentHarnessE2e],
})
export class ComponentHarnessE2eModule {
}
