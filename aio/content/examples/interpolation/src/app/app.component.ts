import { Component } from '@angular/core';

import { CUSTOMERS } from './customers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  customers = CUSTOMERS;
  // #docregion customer
  currentCustomer = 'Maria';
  // #enddocregion customer

  title = 'Featured product:';
  itemImageUrl = '../assets/potted-plant.png';

  recommended = 'You might also like:';
  itemImageUrl2 = '../assets/lamp.png';



  getVal(): number { return 2; }


}
