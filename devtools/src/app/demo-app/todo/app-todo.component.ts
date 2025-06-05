/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, Injectable, viewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

import {DialogComponent} from './dialog.component';

@Injectable()
export class MyServiceA {}

@Component({
  selector: 'app-todo-demo',
  templateUrl: './app-todo.component.html',
  styleUrls: ['./app-todo.component.scss'],
  viewProviders: [MyServiceA],
  standalone: false,
})
export class AppTodoComponent {
  name!: string;
  animal!: string;

  viewChildWillThrowAnError = viewChild.required('thisSignalWillThrowAnError');

  readonly dialog = inject(MatDialog);

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
