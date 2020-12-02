import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: 'Name: <input [(ngModel)]="name">',
})
export class TestCmp {
}
