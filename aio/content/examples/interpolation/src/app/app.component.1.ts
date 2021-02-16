import { Component } from '@angular/core';


// #docregion var-collision
@Component({
  template: `
    <div>
      <!-- Hello, Padma -->
      <h1>Hello, {{customer}}</h1>
      <ul>
        <!-- Ebony and Chiho in a list-->
        <li *ngFor="let customer of customers">{{ customer.value }}</li>
      </ul>
    </div>
  `
})
class AppComponent {
  customers = [{value: 'Ebony'}, {value: 'Chiho'}];
  customer = 'Padma';
}
// #enddocregion var-collision
