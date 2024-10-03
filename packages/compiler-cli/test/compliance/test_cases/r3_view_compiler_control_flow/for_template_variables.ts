import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @for (item of items; track item) {
        Index: {{$index}}
        First: {{$first}}
        Last: {{$last}}
        Even: {{$even}}
        Odd: {{$odd}}
        Count: {{$count}}
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  items = [];
}
