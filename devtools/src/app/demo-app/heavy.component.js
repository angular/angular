/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component, input} from '@angular/core';
const fib = (n) => {
  if (n === 1 || n === 2) {
    return 1;
  }
  return fib(n - 1) + fib(n - 2);
};
let HeavyComponent = class HeavyComponent {
  constructor() {
    this.foo = input();
    this.state = {
      nested: {
        props: {
          foo: 1,
          bar: 2,
        },
        [Symbol(3)]() {
          return 1.618;
        },
        get foo() {
          return 42;
        },
      },
    };
  }
  calculate() {
    return fib(15);
  }
};
HeavyComponent = __decorate(
  [
    Component({
      selector: 'app-heavy',
      templateUrl: './heavy.component.html',
      styleUrls: ['./heavy.component.scss'],
    }),
  ],
  HeavyComponent,
);
export {HeavyComponent};
//# sourceMappingURL=heavy.component.js.map
