/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {RouterModule} from '@angular/router';

import {AppTodoComponent} from './app-todo.component';
import {DialogComponent} from './dialog.component';

@NgModule({
  declarations: [AppTodoComponent, DialogComponent],
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
  ],
  exports: [AppTodoComponent],
  bootstrap: [AppTodoComponent],
})
export class AppModule {
}
