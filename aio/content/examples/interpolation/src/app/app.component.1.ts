import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

// #docregion var-collision
@Component({
  standalone: true,
  template: `
    <div>
      <!-- Hello, Padma -->
      <h1>Hello, {{customer}}</h1>
      <ul>
        <!-- Ebony and Chiho in a list-->
        <li *ngFor="let customer of customers">{{ customer.value }}</li>
      </ul>
    </div>
  `,
  imports: [NgFor]
})
export class AppComponent {
  customers = [{value: 'Ebony'}, {value: 'Chiho'}];
  customer = 'Padma';
}
// #enddocregion var-collision
