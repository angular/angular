import {Component} from '@angular/core';

@Component({
  template: `
    {{value}}
    @let result = value * 2;
    {{value}}
  `,
  standalone: true,
})
export class MyApp {
  value = 0;
}
