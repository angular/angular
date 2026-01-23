import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div [class.initial]="isInitial">Message</div>',
    standalone: false
})
export class TestCmp {
  isInitial: boolean = true;
}
