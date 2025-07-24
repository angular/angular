/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Routes} from '@angular/router';

import {AboutComponent} from './about.component';

export const ABOUT_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: AboutComponent,
  },
];
