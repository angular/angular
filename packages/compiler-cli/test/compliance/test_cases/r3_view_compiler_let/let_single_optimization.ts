import {Component} from '@angular/core';

@Component({
  template: `
    {{value}}
    @let result = value * 2;
    {{value}}
  `,
})
export class MyApp {
  value = 0;
}
