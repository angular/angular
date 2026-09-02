import {Component} from '@angular/core';

@Component({
  template: `
    @boundary {
      Main Content
    } @error (let err, retry = $retry) {
      <button (click)="retry()">Retry</button>
    }
  `
})
export class TestComponent {}
