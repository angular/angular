import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<h2>{{ greeting + " " + name }}</h2>',
})
export class TestCmp {
  greeting: string = '';
  name: string = '';
}
