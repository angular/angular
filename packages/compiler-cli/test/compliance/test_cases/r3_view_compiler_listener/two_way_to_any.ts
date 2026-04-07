import {Component, Directive, model} from '@angular/core';

@Directive({selector: '[ngModel]'})
export class NgModelDirective {
  ngModel = model('');
}

@Component({
  selector: 'test-cmp',
  template: '<input [(ngModel)]="$any(value)">',
  imports: [NgModelDirective],
})
export class TestCmp {
  value = 123;
}
