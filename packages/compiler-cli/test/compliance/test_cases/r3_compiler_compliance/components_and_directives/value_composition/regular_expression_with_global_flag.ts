import {Component} from '@angular/core';

@Component({
  template: `{{/^hello/g.test(value)}}`,
})
export class TestComp {
  value = '123';
}
