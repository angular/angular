import {Component} from '@angular/core';

@Component({
  template: `
    @if (true) {
      @if (true) {
        @if (true) {
          {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
        }
      }
    }
  `,
})
export class TestComp {
  componentProp: {a?: {b?: {c?: () => () => () => () => string}}} = {};
}
