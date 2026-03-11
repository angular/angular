import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<ng-template>{{x}}</ng-template>',
})
export class TestCmp {
  x = 'hello';
}
