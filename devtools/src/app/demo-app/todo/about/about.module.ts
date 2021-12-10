/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {AboutComponent} from './about.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: AboutComponent,
      },
    ]),
  ],
  declarations: [AboutComponent],
  exports: [AboutComponent],
})
export class AboutModule {
}
