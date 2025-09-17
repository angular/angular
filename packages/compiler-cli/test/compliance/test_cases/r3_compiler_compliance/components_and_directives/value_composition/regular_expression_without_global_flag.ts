import {Component} from '@angular/core';

@Component({
  template: `{{/^hello/i.test(value)}}`,
})
export class TestComp {
  value = '123';
}
