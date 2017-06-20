/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({selector: 'recursive-feature-comp', template: 'recursive feature!'})
export class RecursiveFeatureComponent {
}

@NgModule({
  imports: [RouterModule.forChild([
    {path: '', component: RecursiveFeatureComponent, pathMatch: 'full'},
    {path: ':name', loadChildren: './recursive-feature.module#RecursiveFeatureModule'}
  ])],
  declarations: [RecursiveFeatureComponent]
})
export class RecursiveFeatureModule {
}
