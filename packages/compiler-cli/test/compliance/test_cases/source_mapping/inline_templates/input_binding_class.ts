import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<div [class.initial]="isInitial">Message</div>',
})
export class TestCmp {
  isInitial: boolean = true;
}
