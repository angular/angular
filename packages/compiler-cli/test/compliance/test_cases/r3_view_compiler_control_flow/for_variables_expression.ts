import {Component} from '@angular/core';

@Component({
  template: `{#for item of items; track item}{{$odd + ''}}{/for}`,
})
export class MyApp {
  items = [];
  // TODO(crisbeto): remove this once template type checking is fully implemented.
  item: any;
  $odd: any;
}
