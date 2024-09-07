/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {RouterLink, RouterOutlet} from '@angular/router';

import {DialogComponent} from './dialog.component';

@Component({
  selector: 'app-todo-demo',
  imports: [RouterLink, RouterOutlet, MatDialogModule, FormsModule],
  styles: [
    `
      nav {
        padding-top: 20px;
        padding-bottom: 10px;

        a {
          margin-right: 15px;
          text-decoration: none;
        }
      }

      .dialog-open-button {
        border: 1px solid #ccc;
        padding: 10px;
        margin-right: 20px;
      }
    `,
  ],
  template: `
    <nav>
      <a routerLink="/demo-app/todos/app">Todos</a>
      <a routerLink="/demo-app/todos/about">About</a>
    </nav>

    <button class="dialog-open-button" (click)="openDialog()">Open dialog</button>

    <router-outlet></router-outlet>
  `,
})
export class TodoAppComponent {
  name!: string;
  animal!: string;

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data: {name: this.name, animal: this.animal},
    });

    dialogRef.afterClosed().subscribe((result) => {
      // tslint:disable-next-line:no-console
      console.log('The dialog was closed');

      this.animal = result;
    });
  }
}

export const ROUTES = [
  {
    path: 'todos',
    component: TodoAppComponent,
    children: [
      {
        path: 'app',
        loadComponent: () => import('./home/todos.component').then((m) => m.TodosComponent),
      },
      {
        path: 'about',
        loadComponent: () => import('./about/about.component').then((m) => m.AboutComponent),
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
];
