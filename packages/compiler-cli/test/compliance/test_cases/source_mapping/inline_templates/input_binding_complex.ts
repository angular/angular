import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<div [attr]="greeting + name"></div>',
})
export class TestCmp {
}
