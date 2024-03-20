import {Component} from '@angular/core';

@Component({
  template: `@for (item of items; track item) {
    {{$odd + ''}}
  }`,
})
export class MyApp {
  items = [];
}
