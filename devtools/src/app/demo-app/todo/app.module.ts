import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { AppTodoComponent } from './app-todo.component';

import { DialogComponent } from './dialog.component';

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
export class AppModule {}
