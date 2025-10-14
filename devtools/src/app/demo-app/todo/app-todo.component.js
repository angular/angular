/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component, inject, Injectable, viewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DialogComponent} from './dialog.component';
let MyServiceA = class MyServiceA {};
MyServiceA = __decorate([Injectable()], MyServiceA);
export {MyServiceA};
let AppTodoComponent = class AppTodoComponent {
  constructor() {
    this.viewChildWillThrowAnError = viewChild.required('thisSignalWillThrowAnError');
    this.dialog = inject(MatDialog);
  }
  openDialog() {
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
};
AppTodoComponent = __decorate(
  [
    Component({
      selector: 'app-todo-demo',
      templateUrl: './app-todo.component.html',
      styleUrls: ['./app-todo.component.scss'],
      viewProviders: [MyServiceA],
      standalone: false,
    }),
  ],
  AppTodoComponent,
);
export {AppTodoComponent};
//# sourceMappingURL=app-todo.component.js.map
