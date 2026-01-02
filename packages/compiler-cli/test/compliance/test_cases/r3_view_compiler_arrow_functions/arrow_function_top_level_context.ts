import {Component} from '@angular/core';

@Component({
  template: `{{(param => param + value + 1)('param')}}`
})
export class TestComp {
  value = 0;
}
