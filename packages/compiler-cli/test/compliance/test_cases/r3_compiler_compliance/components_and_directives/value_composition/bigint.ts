import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <div>Total: {{ 1234n * multiplier }}</div>
  `,
})
export class MyApp {
  multiplier = 5n;
}
