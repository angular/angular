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
  template: `
    {{ counter() }} -- {{label()}}
  `,
})
export class Greet<T> {
  counter = input(0);
  bla = input();  // TODO: should be a diagnostic. no type & no value
  bla2 = input<string>();
  bla3 = input.required<string>();
  bla4 = input(0, {alias: 'bla4Public'});
  gen = input.required<string>();
  gen2 = input.required<T>();

  label = input<string>();

  works(): T {
    return this.gen2();
  }

  // TODO: should break, but still supported early prototype.
  @Input() oldInput: string|undefined;
}

@Component({
  standalone: true,
  selector: 'my-app',
  template: `
    Hello <greet [counter]="3" [bla4Public]="10" #ok
      [bla3]="someStringVar" gen='this is required' [gen2]="{yes: true}"
      label="Hello {{name()}}"
    />

    <button (click)="ok.works().yes">Click</button>
    <button (click)="updateName()">Change name</button>
  `,
  imports: [Greet],
})
export class MyApp {
  name = signal('Angular');
  someVar = -10;
  someStringVar = 'works';

  protected updateName() {
    this.name.update(n => `${n}-`);
  }

  onClickFromChild() {
    console.info('Click from child');
  }
}

bootstrapApplication(MyApp).catch((e) => console.error(e));
