import {Component} from '@angular/core';

@Component({
  template: `
    @boundary {
      Main Content
    } @error (let err; when err.message === '404') {
      Not Found
    } @error (let err) {
      Generic Error
    }
  `
})
export class TestComponent {}
