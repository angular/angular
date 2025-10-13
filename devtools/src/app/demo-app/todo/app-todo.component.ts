/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {afterRenderEffect, Component, inject, Injectable, signal, viewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

import {DialogComponent} from './dialog.component';
import {RouterOutlet} from '@angular/router';

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
  routerOutlet = viewChild(RouterOutlet);
  readonly dialog = inject(MatDialog);

  /** Only for Signal graph purposes */

  counter = signal(0);

  // tslint:disable-next-line:require-internal-with-underscore
  _ = afterRenderEffect({
    earlyRead: () => {
      return this.counter();
    },
    write: (value) => {
      this.routerOutlet(); // another producer for this phase
      if (value() === 1) {
        this.counter.set(0);
      }
    },
  });

  /* end  */

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
