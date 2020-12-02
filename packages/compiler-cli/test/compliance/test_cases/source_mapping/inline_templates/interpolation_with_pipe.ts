import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<div>{{200.3 | percent : 2 }}</div>',
})
export class TestCmp {
}
