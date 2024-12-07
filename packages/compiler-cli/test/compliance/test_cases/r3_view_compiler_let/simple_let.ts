import {Component} from '@angular/core';

@Component({
  template: `
    @let result = value * 2;
    The result is {{result}}
  `,
})
export class MyApp {
  value = 1;
}
