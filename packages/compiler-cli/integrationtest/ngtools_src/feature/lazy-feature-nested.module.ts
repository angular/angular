/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({selector: 'lazy-feature-comp', template: 'lazy feature, nested!'})
export class LazyFeatureNestedComponent {
}

@NgModule({
  imports: [RouterModule.forChild([
    {path: '', component: LazyFeatureNestedComponent, pathMatch: 'full'},
  ])],
  declarations: [LazyFeatureNestedComponent]
})
export class LazyFeatureNestedModule {
}
