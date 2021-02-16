import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<div bind-title="name"></div>',
})
export class TestCmp {
  name: string = '';
}
