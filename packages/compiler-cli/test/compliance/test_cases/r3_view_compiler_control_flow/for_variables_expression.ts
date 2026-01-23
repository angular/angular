import {Component} from '@angular/core';

@Component({
    template: `@for (item of items; track item) {
    {{$odd + ''}}
  }`,
    standalone: false
})
export class MyApp {
  items = [];
}
