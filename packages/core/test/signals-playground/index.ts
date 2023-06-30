/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, input, Input, signal} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'greet',
  standalone: true,
  signals: true,
  template: `{{ counter() }} -- {{label()}}`,
})
export class Greet<T> {
  counter = input(0);
  bla = input();  // TODO: should be a diagnostic. no type & no value
  bla2 = input<string>();
  bla3 = input({required: true});
  bla4 = input(3, {alias: 'bla4Public'});
  gen = input<T>({required: true});
  gen2 = input<T>();

  label = input<string>();

  works(): T {
    return this.gen();
  }

  // TODO: should break, but still supported early prototype.
  @Input() oldInput: string|undefined;
}

@Component({
  standalone: true,
  selector: 'my-app',
  template: `
    Hello <greet [counter]="3" [bla4Public]="10" #ok
      [bla3]="someVar" [gen]="{yes: true}" label="Hello {{name()}}"
    />

    <button (click)="ok.works().yes">Click</button>
    <button (click)="updateName()">Change name</button>
  `,
  imports: [Greet],
  signals: true,
})
export class MyApp {
  name = signal('Angular');
  someVar = -10;

  protected updateName() {
    this.name.update(n => `${n}-`);
  }
}

bootstrapApplication(MyApp).catch((e) => console.error(e));
