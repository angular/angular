/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Input} from '@angular/core';

const fib = (n: number): number => {
  if (n === 1 || n === 2) {
    return 1;
  }
  return fib(n - 1) + fib(n - 2);
};

@Component({
  selector: 'app-heavy',
  template: `<h1>{{ calculate() }}</h1>`,
})
export class HeavyComponent {
  @Input()
  set foo(_: any) {}

  state = {
    nested: {
      props: {
        foo: 1,
        bar: 2,
      },
      [Symbol(3)](): number {
        return 1.618;
      },
      get foo(): number {
        return 42;
      },
    },
  };
  calculate(): number {
    return fib(15);
  }
}
