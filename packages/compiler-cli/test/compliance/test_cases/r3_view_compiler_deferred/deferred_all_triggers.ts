import {Component} from '@angular/core';

@Component({
  selector: 'heavy-cmp',
  template: 'heavy',
})
export class HeavyComponent {}

@Component({
  selector: 'app-root',
  imports: [HeavyComponent],
  template: `
    <button #trigger>load</button>
    @defer (on interaction(trigger); prefetch on idle) {
      <heavy-cmp />
    } @placeholder (minimum 500ms) {
      <span>placeholder</span>
    } @loading (after 100ms; minimum 1s) {
      <span>loading</span>
    } @error {
      <span>error</span>
    }
  `,
})
export class AppComponent {}
