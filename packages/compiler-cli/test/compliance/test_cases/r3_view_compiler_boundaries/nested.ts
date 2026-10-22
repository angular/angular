import {Component} from '@angular/core';

@Component({
  template: `
    @boundary {
      Outer Main
      @boundary {
        Inner Main
      } @error {
        Inner Fallback
      }
    } @error {
      Outer Fallback
    }
  `
})
export class TestComponent {}
