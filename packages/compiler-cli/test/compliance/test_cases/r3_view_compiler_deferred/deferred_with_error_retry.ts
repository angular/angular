import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      @defer (when isVisible) {
        <p>Loaded!</p>
      } @placeholder {
        <p>Placeholder</p>
      } @error (retry 3) {
        <p>Failed!</p>
      }
    </div>
  `
})
export class MyApp {
  isVisible = false;
}
