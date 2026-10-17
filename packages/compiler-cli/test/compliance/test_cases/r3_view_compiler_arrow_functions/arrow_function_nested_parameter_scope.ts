import {Component} from '@angular/core';

@Component({
  template: `
    {{(x => twice(y => y * 2) + y)(1)}}
    {{(x => twice(y => y) + twice(z => y))(1)}}
  `,
})
export class TestComp {
  y = 100;

  twice(fn: (value: number) => number): number {
    return fn(1) * 2;
  }
}
