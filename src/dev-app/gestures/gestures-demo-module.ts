/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {GesturesDemo} from './gestures-demo';

@NgModule({
  imports: [RouterModule.forChild([{path: '', component: GesturesDemo}])],
  declarations: [GesturesDemo],
})
export class GesturesDemoModule {
}
