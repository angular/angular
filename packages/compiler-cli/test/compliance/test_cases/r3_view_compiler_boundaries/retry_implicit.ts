import { Component } from '@angular/core';

@Component({
  template: `
    @boundary {
      Main Content
    } @error {
      <button (click)="$reset()">Retry</button>
    }
  `
})
export class TestComponent {}
