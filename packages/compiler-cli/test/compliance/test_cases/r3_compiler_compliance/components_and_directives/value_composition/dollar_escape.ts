import {Component} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: `\${{price}}`,
  standalone: false,
})
export class MyComponent {
  price = '3.50';
}

