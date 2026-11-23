import { Component } from '@angular/core';

@Component({
  template: `
    @boundary {
      Main Content
    } @error (let err, retry = $reset) {
      <button (click)="retry()">Retry</button>
    }
  `
})
export class TestComponent {}
