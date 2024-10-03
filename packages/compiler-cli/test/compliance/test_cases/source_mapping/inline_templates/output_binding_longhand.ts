import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<button on-click="doSomething()">Do it</button>',
    standalone: false
})
export class TestCmp {
  doSomething() {}
}
