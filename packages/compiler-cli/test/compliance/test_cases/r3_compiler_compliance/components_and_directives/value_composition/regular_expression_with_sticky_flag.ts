import {Component} from '@angular/core';

@Component({
  template: `{{/^hello/y.test(value)}}`,
})
export class TestComp {
  value = '123';
}
