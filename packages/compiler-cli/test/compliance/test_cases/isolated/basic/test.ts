import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '{{x?.toString()}}',
})
export class TestCmp {
  x?: string;
}
