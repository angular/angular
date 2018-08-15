/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

@Component({
  selector: 'aot-router',
  template: '<router-outlet></router-outlet>',
})
export class AotRouterCmp {
}

@Component({
  selector: 'aot-router-child',
  template: 'arc',
})
export class AotRouterChildCmp {
}

export const ROUTES: Routes = [
  {path: '', component: AotRouterChildCmp},
];

@NgModule({
  declarations: [
    AotRouterCmp,
    AotRouterChildCmp,
  ],
  exports: [
    AotRouterCmp,
    AotRouterChildCmp,
  ],
  imports: [
    RouterModule.forRoot(ROUTES),
  ],
})
export class AotRouterModule {
}
