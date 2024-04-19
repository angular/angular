import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<div i18n>Hello, {{name}}!</div>',
})
export class TestCmp {
  name: string = '';
}
