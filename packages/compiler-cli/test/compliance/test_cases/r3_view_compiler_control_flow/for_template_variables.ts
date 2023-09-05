import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      {#for item of items; track item}
        Index: {{$index}}
        First: {{$first}}
        Last: {{$last}}
        Even: {{$even}}
        Odd: {{$odd}}
        Count: {{$count}}
      {/for}
    </div>
  `,
})
export class MyApp {
  message = 'hello';
  items = [];

  // TODO(crisbeto): remove this once template type checking is fully implemented.
  item: any;
  $index: any;
  $first: any;
  $last: any;
  $even: any;
  $odd: any;
  $count: any;
}
