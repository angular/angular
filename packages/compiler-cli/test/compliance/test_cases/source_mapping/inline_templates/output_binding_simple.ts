import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<button (click)="doSomething()">Do it</button>',
    standalone: false
})
export class TestCmp {
  doSomething() {}
}
