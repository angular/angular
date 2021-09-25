/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({selector: 'lazy-feature-comp', template: 'lazy feature!'})
export class LazyFeatureComponent {
}

@NgModule({
  imports: [RouterModule.forChild([
    {path: '', component: LazyFeatureComponent, pathMatch: 'full'}, {
      path: 'feature',
      loadChildren: () => import('./feature.module').then(mod => mod.FeatureModule)
    },
    {
      path: 'nested-feature',
      loadChildren: () =>
          import('./lazy-feature-nested.module').then(mod => mod.LazyFeatureNestedModule)
    }
  ])],
  declarations: [LazyFeatureComponent]
})
export class LazyFeatureModule {
}
