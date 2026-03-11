import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<button (click)="handleClick($event)"></button>',
})
export class TestCmp {
  handleClick(event: MouseEvent) {}
}
