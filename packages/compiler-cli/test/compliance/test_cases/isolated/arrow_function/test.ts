import {Component, signal} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<button (click)="value.update(prev => prev + 1)"></button>',
})
export class TestCmp {
  value = signal(1);
}
