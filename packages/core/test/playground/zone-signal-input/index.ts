/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, EventEmitter, Input, input, Output, signal} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'greet',
  template: `
    {{ counter() }} -- {{label()}}

    <p>Two way: {{twoWay()}}</p>
    <button (click)="twoWayChange.emit(!twoWay())">
      Two Way output from child
    </button>
  `,
})
export class Greet<T> {
  counter = input(0);
  bla = input(); // TODO: should be a diagnostic. no type & no value
  bla2 = input<string>();
  bla3 = input.required<string>();
  bla4 = input(0, {alias: 'bla4Public'});
  gen = input.required<string>();
  gen2 = input.required<T>();

  label = input<string>();

  twoWay = input(false);
  @Output() twoWayChange = new EventEmitter();

  works(): T {
    return this.gen2();
  }

  // Eventually in signal components, a mix not allowed. For now, this is
  // supported though.
  @Input() oldInput: string | undefined;
}

@Component({
  selector: 'my-app',
  template: `
    Hello <greet [counter]="3" [bla4Public]="10" #ok
      [bla3]="someStringVar" gen='this is required' [gen2]="{yes: true}"
      label="Hello {{name()}}"
      [(twoWay)]="twoWay"
    />

    <p>Two way outside: {{twoWay}}</p>

    <button (click)="ok.works().yes">Click</button>
    <button (click)="updateName()">Change name</button>
    <button (click)="twoWay = !twoWay">Change Two way (outside)</button>

  `,
  imports: [Greet],
})
export class MyApp {
  name = signal('Angular');
  someVar = -10;
  someStringVar = 'works';
  twoWay = false;

  protected updateName() {
    this.name.update((n) => `${n}-`);
  }

  onClickFromChild() {
    console.info('Click from child');
  }
}

bootstrapApplication(MyApp).catch((e) => console.error(e));
