import {Component} from '@angular/core';

@Component({
  template: `
    @defer (hydrate on idle) {
      One
    }
    @defer (hydrate on timer(500)) {
      Two
    }
  `,
})
export class MyApp {}
