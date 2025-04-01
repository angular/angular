import {Component} from '@angular/core';

@Component({
  template: `
    @let one = value + 1;
    @let two = one + 1;
    @let result = two + 1;
    The result is {{result}}
  `,
})
export class MyApp {
  value = 1;
}
