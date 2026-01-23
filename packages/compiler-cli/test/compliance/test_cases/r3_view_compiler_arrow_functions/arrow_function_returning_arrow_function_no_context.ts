import {Component} from '@angular/core';

@Component({
  template: `{{(a => b => c => d => a + b + c + d)(1)(2)(3)(4)}}`,
})
export class TestComp {}
