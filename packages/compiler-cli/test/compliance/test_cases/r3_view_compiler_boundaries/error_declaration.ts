import {Component} from '@angular/core';

@Component({
  template: `
    @boundary {
      Main Content
    } @error (let err) {
      Error: {{err.message}}
    }
  `
})
export class TestComponent {}
