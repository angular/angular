import {Component} from '@angular/core';
import {NgFor} from '@angular/common';

// #docregion var-collision
@Component({
  standalone: true,
  template: `
    <div>
      <!-- Hello, Padma -->
      <h1>Hello, {{customer}}</h1>
      <ul>
        <!-- Ebony and Chiho in a list-->
        @for (customer of customers; track customer) {
          <li>{{ customer.value }}</li>
        }
      </ul>
    </div>
  `,
})
export class AppComponent {
  customers = [{value: 'Ebony'}, {value: 'Chiho'}];
  customer = 'Padma';
}
// #enddocregion var-collision
