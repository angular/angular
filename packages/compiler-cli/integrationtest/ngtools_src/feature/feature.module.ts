/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({selector: 'feature-component', template: 'foo.html'})
export class FeatureComponent {
}

@NgModule({
  declarations: [FeatureComponent],
  imports: [RouterModule.forChild([{path: '', component: FeatureComponent}])]
})
export class FeatureModule {
}
