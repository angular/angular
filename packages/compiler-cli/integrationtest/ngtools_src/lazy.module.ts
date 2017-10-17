/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({selector: 'lazy-comp', template: 'lazy!'})
export class LazyComponent {
}

@NgModule({
  imports: [[RouterModule.forChild([
    {path: '', component: LazyComponent, pathMatch: 'full'},
    {path: 'feature', loadChildren: './feature/feature.module#FeatureModule'},
    {path: 'lazy-feature', loadChildren: './feature/lazy-feature.module#LazyFeatureModule'}
  ])]],
  declarations: [LazyComponent]
})
export class LazyModule {
}

export class SecondModule {}
