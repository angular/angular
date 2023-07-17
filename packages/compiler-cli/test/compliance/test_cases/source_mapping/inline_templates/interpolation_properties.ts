import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<div id="{{name}}"></div>',
})
export class TestCmp {
  name: string = '';
}
