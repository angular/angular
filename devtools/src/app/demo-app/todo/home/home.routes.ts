/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Routes} from '@angular/router';

import {TodosComponent} from './todos.component';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: TodosComponent,
    pathMatch: 'full',
  },
];
