import {Component} from '@angular/core';

@Component({
  template: `
    {{fn(...foo)}}
    <hr>
    {{fn(1, ...foo, 2)}}
    <hr>
    {{fn(...foo, 1, ...bar, ...baz, 2)}}
    <hr>
    {{fn(1, ...[2, ...[3]])}}
  `,
})
export class TestComp {
  foo = [];
  bar = [];
  baz = [];
  fn(..._: any[]) {}
}
