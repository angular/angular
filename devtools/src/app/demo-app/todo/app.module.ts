/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {RouterModule} from '@angular/router';

import {AppTodoComponent} from './app-todo.component';
import {DialogComponent} from './dialog.component';

@NgModule({
  declarations: [AppTodoComponent],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: 'todos',
        component: AppTodoComponent,
        children: [
          {
            path: 'app',
            loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
          },
          {
            path: 'about',
            loadChildren: () => import('./about/about.module').then((m) => m.AboutModule),
          },
          {
            path: 'routes',
            loadChildren: () => import('./routes/routes.module').then((m) => m.RoutesModule),
          },
          {
            path: '**',
            redirectTo: 'app',
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'todos',
      },
    ]),
    DialogComponent,
  ],
  exports: [AppTodoComponent],
  bootstrap: [AppTodoComponent],
})
export class AppModule {}
