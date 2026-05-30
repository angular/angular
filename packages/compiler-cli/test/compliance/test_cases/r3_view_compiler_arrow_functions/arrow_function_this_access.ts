import {Component} from '@angular/core';

@Component({
  template: `{{((a, b) => a + this.a + b + this.b)(1, 3)}}`
})
export class TestComp {
  a = 2;
  b = 4;
}
