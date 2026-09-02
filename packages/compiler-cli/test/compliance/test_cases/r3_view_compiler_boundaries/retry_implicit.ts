import {Component} from '@angular/core';

@Component({
  template: `
    @boundary {
      Main Content
    } @error {
      <button (click)="$retry()">Retry</button>
    }
  `
})
export class TestComponent {}
