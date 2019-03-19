/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FocusOriginDemo} from './focus-origin-demo';

@NgModule({
  imports: [
    A11yModule,
    RouterModule.forChild([{path: '', component: FocusOriginDemo}]),
  ],
  declarations: [FocusOriginDemo],
})
export class FocusOriginDemoModule {
}
