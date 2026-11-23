import {Component} from '@angular/core';

@Component({
  template: `
    @boundary {
      Main Content
    } @error (let err; when err.message === '404') {
      Not Found
    }
  `
})
export class TestComponent {}
