/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {RouterOutlet, Routes} from '@angular/router';

import * as animationDslExample from './animation/ts/dsl/module';
import * as diContentChildExample from './di/ts/contentChild/module';
import * as diContentChildrenExample from './di/ts/contentChildren/module';
import * as diViewChildExample from './di/ts/viewChild/module';
import * as diViewChildrenExample from './di/ts/viewChildren/module';
import * as testabilityWhenStableExample from './testability/ts/whenStable/module';

@Component({
  selector: 'example-app',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class TestsAppComponent {}

export const routes: Routes = [
  {path: 'animation/dsl', component: animationDslExample.AppComponent},
  {path: 'di/contentChild', component: diContentChildExample.AppComponent},
  {path: 'di/contentChildren', component: diContentChildrenExample.AppComponent},
  {path: 'di/viewChild', component: diViewChildExample.AppComponent},
  {path: 'di/viewChildren', component: diViewChildrenExample.AppComponent},
  {path: 'testability/whenStable', component: testabilityWhenStableExample.AppComponent},
];
