import {Component} from '@angular/core';

@Component({
  template: `
    @boundary {
      Main Content
    } @error {
      Fallback Content
    }
  `
})
export class TestComponent {}
