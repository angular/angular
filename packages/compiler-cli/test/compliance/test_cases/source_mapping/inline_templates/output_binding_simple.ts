import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<button (click)="doSomething()">Do it</button>',
})
export class TestCmp {
  doSomething() {}
}
