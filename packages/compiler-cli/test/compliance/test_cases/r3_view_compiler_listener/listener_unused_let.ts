import {Component} from '@angular/core';

@Component({
  template: `
    @let foo = 123;
    <button (click)="noop()"></button>
    {{foo}}
  `,
})
export class TestCmp {
  noop() {}
}
